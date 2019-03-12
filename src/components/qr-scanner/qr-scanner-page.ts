// (C) Copyright 2018 REVEAL
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { QrReaderProvider } from './../../providers/qrReader';
import { CoreLoginCredentialsPage } from './../../core/login/pages/credentials/credentials';
import { NavController, NavParams, AlertController, Platform } from 'ionic-angular';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { safelyParseJSON } from '../../helpers/navigation_helpers';
import { NavigationMapProvider } from '@providers/navigation-map-provider';
import { CoreCourseSectionPage } from './../../core/course/pages/section/section';
import { CoreCoursesProvider } from '@core/courses/providers/courses';
import { CoreDomUtilsProvider } from '@providers/utils/dom';
import { CoreEventsProvider } from '@providers/events';
import { CoreSitesProvider } from '@providers/sites';
import { CoreCourseOptionsDelegate } from '@core/course/providers/options-delegate';
import { CoreUtilsProvider } from '@providers/utils/utils';
import * as moment from 'moment';
import { CoreCourseFormatDelegate } from '@core/course/providers/format-delegate';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'qr-scanner-page',
    templateUrl: 'qr-scanner-page.html'
})
export class QrScannerPage {
    @ViewChild('sendbutton', { read: ElementRef }) sendbutton: ElementRef;

    scanned: string = '';
    scanSubscribe;
    isLoginScan: boolean = false;
    callingComponent: any;
    typeOfQrCode: string;
    course: any;
    enrolCourse: any = {};
    dataLoaded: boolean;
    selfEnrolInstances: any[] = [];
    isEnrolled: boolean;
    canAccessCourse = true;
    courses = {
        selected: 'inprogress',
        loaded: false,
        filter: '',
        past: [],
        inprogress: [],
        future: []
    };
    showFilter = false;
    filteredCourses: any[];
    scannerOptions: BarcodeScannerOptions = {};

    protected guestInstanceId: number;
    protected enrollmentMethods: any[];
    protected waitStart = 0;
    protected pageDestroyed = false;
    protected guestWSAvailable: boolean;
    protected isGuestEnabled = false;
    protected courseIds = '';
    protected AB_TABLE = 'abuser';

    constructor(
        public navCtrl: NavController,
        navParams: NavParams,
        private platform: Platform,
        private alertCtrl: AlertController,
        private qrReaderProvider: QrReaderProvider,
        private navigationMapProvider: NavigationMapProvider,
        private coursesProvider: CoreCoursesProvider,
        private domUtils: CoreDomUtilsProvider,
        private eventsProvider: CoreEventsProvider,
        private sitesProvider: CoreSitesProvider,
        private courseOptionsDelegate: CoreCourseOptionsDelegate,
        private utils: CoreUtilsProvider,
        private courseFormatDelegate: CoreCourseFormatDelegate,
        private barcodeScanner: BarcodeScanner,
        private translate: TranslateService
    ) {
        this.isLoginScan = navParams.get('isLogin');
        this.callingComponent = navParams.get('callingComponent');
        this.course = navParams.get('course');

        translate.get('core.scannertext').subscribe((res: string) => {
            this.scannerOptions.prompt = res;
        });
        this.scannerOptions.showFlipCameraButton = true;
        this.scannerOptions.resultDisplayDuration = 0;
    }

    ionViewDidEnter(): void {
        this.platform.ready().then(() => {
            this.scan();
        });
    }

    scan(): void {
        this.barcodeScanner.scan(this.scannerOptions).then(
            (barcodeData) => {
                const isLoggedIn = this.sitesProvider.isLoggedIn();
                this.scanned = barcodeData.text;
                if (this.doesQrCodeAndCalledComponentMatch()) {
                    // Have to go this curious way with Elementref and trigger click,
                    // Cause fire event here in subscription don`t work well (takes very long)

                    this.sendbutton.nativeElement.click();
                } else {
                    if (!barcodeData.cancelled) {
                        if (this.typeOfQrCode === 'login' && isLoggedIn) {
                            this.presentAlert('error', 'alreadyLoggedIn');
                        } else {
                            this.presentAlert();
                        }
                    } else {
                        this.closeAndGoBack();
                    }
                }
            },
            (err) => {
                this.presentAlert('error');
            }
        );
    }

    closeAndGoBack(): void {
        if (this.navCtrl.canGoBack()) {
            this.navCtrl.pop();
        }
    }

    closeAndGoToComponent(component: any, paramsObject: any = {}): void {
        this.navCtrl.push(component, paramsObject);
    }

    whatQrCodeIsIt(): string {
        const scannedAsObject: any = safelyParseJSON(this.scanned);

        if (scannedAsObject.qrType && scannedAsObject.qrType !== 'undefined') {
            switch (scannedAsObject.qrType) {
                case 'login':
                    this.typeOfQrCode = 'login';
                    break;
                case 'section':
                    this.typeOfQrCode = 'section';
                    break;
                case 'enrol':
                    this.typeOfQrCode = 'enrol';
                    break;
                default:
                    this.typeOfQrCode = 'unknown';
            }
        } else {
            this.typeOfQrCode = 'unknown';
        }

        return this.typeOfQrCode;
    }

    /**
     * Returns whether the qr code is valid.
     * @return {boolean} whether the qr code is valid
     */
    doesQrCodeAndCalledComponentMatch(): boolean {
        const typeOfQrCode = this.whatQrCodeIsIt();
        if (this.callingComponent && this.callingComponent instanceof CoreLoginCredentialsPage && typeOfQrCode === 'login') {
            return true;
        } else if (typeOfQrCode === 'section') {
            return true;
        } else if (typeOfQrCode === 'enrol') {
            return true;
        } else {
            return false;
        }
    }

    presentAlert(title: string = 'error', message: string = 'wrongQrCode'): void {
        this.translate.get([`core.${title}`, `core.${message}`]).subscribe((res: string) => {
            console.log('object after translate array');
            console.log(res);
            console.log(res[`core.${message}`]);
            const alert = this.alertCtrl.create({
                title: res[`core.${title}`],
                message: res[`core.${message}`],
                buttons: [
                    {
                        text: 'OK',
                        role: 'cancel',
                        handler: (): void => {
                            this.closeAndGoBack();
                        }
                    }
                ]
            });
            alert.present();
        });
    }

    /**
     * Sends the qr reader readed data to the components or emits the event to emit data.
     *
     * @return {void}
     */
    sendJson(): void {
        let data: any, topicsToSectionIdArray: any[], foundTopicAndSectionId: any;
        if (this.typeOfQrCode === 'login') {
            if (this.sitesProvider.isLoggedIn()) {
                this.presentAlert('error', 'alreadyLoggedIn');
            } else {
                this.qrReaderProvider.emitLoginData(this.scanned);
            }
        } else if (this.typeOfQrCode === 'section') {
            if (!this.sitesProvider.isLoggedIn()) {
                this.presentAlert('error', 'notLoggedIn');
            } else {
                // TODO: check if qr code is valid and show alert when not and reset
                data = safelyParseJSON(this.scanned);
                topicsToSectionIdArray = this.navigationMapProvider.getTopicsToSectionIdArray();
                foundTopicAndSectionId = topicsToSectionIdArray.find((topic) => {
                    if (data.exhibit.map && typeof data.exhibit.map !== 'undefined') {
                        if (data.exhibit.map !== topic.jsonString.map) {
                            return false;
                        }
                    }
                    if (data.exhibit.room === topic.jsonString.room && data.exhibit.exponat === topic.jsonString.exponat) {
                        return true;
                    }
                });
                if (foundTopicAndSectionId !== undefined) {
                    const currentIndex = this.navCtrl.getActive().index;
                    this.navCtrl
                        .push(CoreCourseSectionPage, { course: this.course, newSectionId: foundTopicAndSectionId.sectionId })
                        .then(() => {
                            this.navCtrl.remove(currentIndex);
                        });
                }
            }
        } else if (this.typeOfQrCode === 'enrol') {
            if (!this.sitesProvider.isLoggedIn()) {
                this.presentAlert('error', 'notLoggedIn');
            } else {
                data = safelyParseJSON(this.scanned);
                this.enrolCourse.id = data.courseId;
                this.coursesProvider.getCourseEnrolmentMethods(data.courseId).then((methods) => {
                    const enrolMethodInstance = methods.find((method) => {
                        return method.name === data.enrolName;
                    });
                    if (enrolMethodInstance) {
                        this.selfEnrolInCourse(data.password, enrolMethodInstance.id, data.courseId)
                            .then((value) => {
                                const siteId = this.sitesProvider.getCurrentSiteId();
                                this.sitesProvider.getSite(siteId).then((site) => {
                                    const userRecord = {
                                        currentCourseId: data.courseId
                                    };

                                    return site.getDb().updateRecords(this.AB_TABLE, userRecord, { userId: 1 });
                                });
                            })
                            .then(() => {
                                this.fetchMyOverviewCourses();
                            });
                    }
                });
            }
        }
    }

    /**
     * Self enrol in a course.
     *
     * @param {string} password Password to use.
     * @param {number} instanceId The instance ID.
     * @return {Promise<any>} Promise resolved when self enrolled.
     */
    selfEnrolInCourse(password: string, instanceId: number, courseId: number): Promise<any> {
        const modal = this.domUtils.showModalLoading('core.loading', true);

        return this.coursesProvider
            .selfEnrol(courseId, password, instanceId)
            .then(() => {
                // Close modal and refresh data.
                this.isEnrolled = true;
                this.dataLoaded = false;

                // Sometimes the list of enrolled courses takes a while to be updated. Wait for it.
                return this.waitForEnrolled(true).then(() => {
                    this.refreshData().finally(() => {
                        // My courses have been updated, trigger event.
                        this.eventsProvider.trigger(
                            CoreCoursesProvider.EVENT_MY_COURSES_UPDATED,
                            {},
                            this.sitesProvider.getCurrentSiteId()
                        );
                    });
                });
            })
            .catch((error) => {
                if (error && error.code === CoreCoursesProvider.ENROL_INVALID_KEY) {
                    this.presentAlert('error');
                }

                this.domUtils.showErrorModalDefault(error, 'core.courses.errorselfenrol', true);
            })
            .finally(() => {
                modal.dismiss();
            });
    }

    /**
     * Refresh the data.
     *
     * @param {any} [refresher] The refresher if this was triggered by a Pull To Refresh.
     */
    refreshData(refresher?: any): Promise<any> {
        const promises = [];

        promises.push(this.coursesProvider.invalidateUserCourses());
        promises.push(this.coursesProvider.invalidateCourse(this.enrolCourse.id));
        promises.push(this.coursesProvider.invalidateCourseEnrolmentMethods(this.enrolCourse.id));
        promises.push(this.courseOptionsDelegate.clearAndInvalidateCoursesOptions(this.enrolCourse.id));
        if (this.guestInstanceId) {
            promises.push(this.coursesProvider.invalidateCourseGuestEnrolmentInfo(this.guestInstanceId));
        }

        return Promise.all(promises)
            .finally(() => {
                return this.getCourse(true);
            })
            .finally(() => {
                if (refresher) {
                    refresher.complete();
                }
            });
    }

    /**
     * Wait for the user to be enrolled in the course.
     *
     * @param {boolean} first If it's the first call (true) or it's a recursive call (false).
     * @return {Promise<any>} Promise resolved when enrolled or timeout.
     */
    protected waitForEnrolled(first?: boolean): Promise<any> {
        if (first) {
            this.waitStart = Date.now();
        }

        // Check if user is enrolled in the course.
        return this.coursesProvider
            .invalidateUserCourses()
            .catch(() => {
                // Ignore errors.
            })
            .then(() => {
                return this.coursesProvider.getUserCourse(this.enrolCourse.id, false);
            })
            .catch((value) => {
                // Not enrolled, wait a bit and try again.
                if (this.pageDestroyed || Date.now() - this.waitStart > 60000) {
                    // Max time reached or the user left the view, stop.
                    return;
                }

                return new Promise(
                    (resolve, reject): void => {
                        setTimeout(() => {
                            if (!this.pageDestroyed) {
                                // Wait again.
                                this.waitForEnrolled().then(resolve);
                            } else {
                                resolve();
                            }
                        }, 5000);
                    }
                );
            });
    }

    /**
     * Convenience function to get course. We use this to determine if a user can see the course or not.
     *
     * @param {boolean} refresh Whether the user is refreshing the data.
     */
    protected getCourse(refresh?: boolean): Promise<any> {
        // Get course enrolment methods.
        this.selfEnrolInstances = [];

        return this.coursesProvider
            .getCourseEnrolmentMethods(this.enrolCourse.id)
            .then((methods) => {
                this.enrollmentMethods = methods;

                this.enrollmentMethods.forEach((method) => {
                    if (method.type === 'self') {
                        this.selfEnrolInstances.push(method);
                    } else if (this.guestWSAvailable && method.type === 'guest') {
                        this.isGuestEnabled = true;
                    }
                });
            })
            .catch((error) => {
                this.domUtils.showErrorModalDefault(error, 'Error getting enrolment data');
            })
            .then(() => {
                // Check if user is enrolled in the course.
                return this.coursesProvider
                    .getUserCourse(this.enrolCourse.id)
                    .then((course) => {
                        this.isEnrolled = true;

                        return course;
                    })
                    .catch(() => {
                        // The user is not enrolled in the course.
                        // Use getCourses to see if it's an admin/manager and can see the course.
                        this.isEnrolled = false;

                        return this.coursesProvider.getCourse(this.enrolCourse.id);
                    })
                    .then((course) => {
                        // Success retrieving the course, we can assume the user has permissions to view it.
                        this.enrolCourse.fullname = course.fullname || this.enrolCourse.fullname;
                        this.enrolCourse.summary = course.summary || this.enrolCourse.summary;
                        this.canAccessCourse = true;
                    })
                    .catch(() => {
                        // The user is not an admin/manager. Check if we can provide guest access to the course.
                        return this.canAccessAsGuest()
                            .then((passwordRequired) => {
                                this.canAccessCourse = !passwordRequired;
                            })
                            .catch(() => {
                                this.canAccessCourse = false;
                            });
                    });
            })
            .finally(() => {
                this.dataLoaded = true;
            });
    }

    /**
     * Open a course.
     *
     * @param {any} course The course to open.
     */
    openCourse(course: any): void {
        this.courseFormatDelegate.openCourse(this.navCtrl, course);
    }

    getCurrentCourseFromUser(): Promise<any> {
        const siteId = this.sitesProvider.getCurrentSiteId();

        return this.sitesProvider
            .getSite(siteId)
            .then((site) => {
                return site.getDb().getRecords(this.AB_TABLE);
            })
            .then((value) => {
                return value[0].currentCourseId;
            });
    }

    /**
     * Fetch the courses for my overview.
     *
     * @return {Promise<any>} Promise resolved when done.
     */
    protected fetchMyOverviewCourses(): Promise<any> {
        return this.fetchUserCourses()
            .then((courses) => {
                const today = moment().unix();

                this.courses.past = [];
                this.courses.inprogress = [];
                this.courses.future = [];

                courses.forEach((course) => {
                    if (course.startdate > today) {
                        // Courses that have not started yet.
                        this.courses.future.push(course);
                    } else if (course.enddate && course.enddate < today) {
                        // Courses that have already ended.
                        this.courses.past.push(course);
                    } else {
                        // Courses still in progress.
                        this.courses.inprogress.push(course);
                    }
                });

                this.courses.filter = '';
                this.showFilter = false;
                this.filteredCourses = this.courses[this.courses.selected];

                if (this.filteredCourses.length) {
                    this.getCurrentCourseFromUser().then((currentCourseId) => {
                        let courseIndex = 0;
                        if (currentCourseId) {
                            // Could be null
                            courseIndex = this.filteredCourses.findIndex((filteredCourse) => {
                                return filteredCourse.id === currentCourseId;
                            });
                        }
                        this.openCourse(this.filteredCourses[courseIndex]);
                    });
                } else {
                    this.openCourse(this.filteredCourses[0]);
                }
            })
            .catch((error) => {
                this.domUtils.showErrorModalDefault(error, 'Error getting my overview data.');
            });
    }

    /**
     * Check if the user can access as guest.
     *
     * @return {Promise<boolean>} Promise resolved if can access as guest, rejected otherwise. Resolve param indicates if
     *                            password is required for guest access.
     */
    protected canAccessAsGuest(): Promise<boolean> {
        if (!this.isGuestEnabled) {
            return Promise.reject(null);
        }

        // Search instance ID of guest enrolment method.
        this.guestInstanceId = undefined;
        for (let i = 0; i < this.enrollmentMethods.length; i++) {
            const method = this.enrollmentMethods[i];
            if (method.type == 'guest') {
                this.guestInstanceId = method.id;
                break;
            }
        }

        if (this.guestInstanceId) {
            return this.coursesProvider.getCourseGuestEnrolmentInfo(this.guestInstanceId).then((info) => {
                if (!info.status) {
                    // Not active, reject.
                    return Promise.reject(null);
                }

                return info.passwordrequired;
            });
        }

        return Promise.reject(null);
    }

    /**
     * Fetch user courses.
     *
     * @return {Promise<any>} Promise resolved when done.
     */
    protected fetchUserCourses(): Promise<any> {
        return this.coursesProvider.getUserCourses(false).then((courses) => {
            const promises = [],
                courseIds = courses.map((course) => {
                    return course.id;
                });

            if (this.coursesProvider.canGetAdminAndNavOptions()) {
                // Load course options of the course.
                promises.push(
                    this.coursesProvider.getCoursesAdminAndNavOptions(courseIds).then((options) => {
                        courses.forEach((course) => {
                            course.navOptions = options.navOptions[course.id];
                            course.admOptions = options.admOptions[course.id];
                        });
                    })
                );
            }

            this.courseIds = courseIds.join(',');

            if (this.courseIds && this.coursesProvider.isGetCoursesByFieldAvailable()) {
                // Load course image of all the courses.
                promises.push(
                    this.coursesProvider.getCoursesByField('ids', this.courseIds).then((coursesInfo) => {
                        coursesInfo = this.utils.arrayToObject(coursesInfo, 'id');
                        courses.forEach((course) => {
                            if (
                                coursesInfo[course.id] &&
                                coursesInfo[course.id].overviewfiles &&
                                coursesInfo[course.id].overviewfiles[0]
                            ) {
                                course.imageThumb = coursesInfo[course.id].overviewfiles[0].fileurl;
                            } else {
                                course.imageThumb = false;
                            }
                        });
                    })
                );
            }

            return Promise.all(promises).then(() => {
                return courses.sort((a, b) => {
                    const compareA = a.fullname.toLowerCase(),
                        compareB = b.fullname.toLowerCase();

                    return compareA.localeCompare(compareB);
                });
            });
        });
    }
}
