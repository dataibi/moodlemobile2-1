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
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';
import { safelyParseJSON } from '../../helpers/navigation_helpers';
import { NavigationMapProvider } from '@providers/navigation-map-provider';
import { CoreCourseSectionPage } from './../../core/course/pages/section/section';
import { CoreCoursesProvider } from '@core/courses/providers/courses';
import { CoreDomUtilsProvider } from '@providers/utils/dom';
import { CoreEventsProvider } from '@providers/events';
import { CoreSitesProvider } from '@providers/sites';
import { CoreCourseOptionsDelegate } from '@core/course/providers/options-delegate';

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
  enrolCourse: any;
  dataLoaded: boolean;
  selfEnrolInstances: any[] = [];
  isEnrolled: boolean;
  canAccessCourse = true;

  protected guestInstanceId: number;
  protected enrollmentMethods: any[];
  protected waitStart = 0;
  protected pageDestroyed = false;
  protected guestWSAvailable: boolean;
  protected isGuestEnabled = false;

  constructor(
    public navCtrl: NavController,
    navParams: NavParams,
    private qrScanner: QRScanner,
    private platform: Platform,
    private alertCtrl: AlertController,
    private qrReaderProvider: QrReaderProvider,
    private navigationMapProvider: NavigationMapProvider,
    private coursesProvider: CoreCoursesProvider,
    private domUtils: CoreDomUtilsProvider,
    private eventsProvider: CoreEventsProvider,
    private sitesProvider: CoreSitesProvider,
    private courseOptionsDelegate: CoreCourseOptionsDelegate
  ) {
    this.isLoginScan = navParams.get('isLogin');
    this.callingComponent = navParams.get('callingComponent');
    this.course = navParams.get('course');
  }

  ionViewDidEnter(): void {
    this.platform.ready().then(() => {
      this.openQr();
    });
  }

  ionViewWillLeave(): void {
    this.closeScanner();
  }

  closeScanner(): Promise<QRScannerStatus> {
    this.scanSubscribe.unsubscribe(); // Stop scanning
    this.hideCamera(); // Remove css classes for the transparent background

    return this.qrScanner.destroy(); // Destroy instance
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
    if (
      this.callingComponent &&
      this.callingComponent instanceof CoreLoginCredentialsPage &&
      typeOfQrCode === 'login'
    ) {
      return true;
    } else if (typeOfQrCode === 'section') {
	  return true;
	} else if (typeOfQrCode === 'enrol') {
		return true;
    } else {
      return false;
    }
  }

  presentAlert(): void {
    const alert = this.alertCtrl.create({
      title: 'QR Code not correct',
      message: 'Please try another code generated for this project',
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
  }

  /**
   * Only for the transparent background and css
   * @return {void}
   */
  showCamera(): void {
    (window.document.querySelector('ion-app') as HTMLElement).classList.add('cameraView');
  }

  /**
   * Only for the transparent background and css
   * @return {void}
   */
  hideCamera(): void {
    (window.document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');
  }

  /**
   * Test permission for scanner, open camera for qr reader and create subscription for scanned material
   * @return {void}
   */
  openQr(): void {
    // Optionally request the permission early
    this.qrScanner
      .prepare()
      .then((status: QRScannerStatus) => {
        if (status.authorized) {
          // Camera permission was granted

          // Start scanning
          this.scanSubscribe = this.qrScanner.scan().subscribe((text: string) => {
            this.scanned = text;
            if (this.doesQrCodeAndCalledComponentMatch()) {
              // Have to go this curious way with Elementref and trigger click,
              // Cause fire event here in subscription don`t work well (takes very long)
              this.sendbutton.nativeElement.click();
            } else {
              this.presentAlert();
            }
          });

          this.showCamera();
          this.qrScanner.show();

          // Wait for user to scan something, then the observable callback will be called
        } else if (status.denied) {
          alert('denied');
          // Camera permission was permanently denied
          // You must use QRScanner.openSettings() method to guide the user to the settings page
          // Then they can grant the permission from there
        } else {
          // Permission was denied, but not permanently. You can ask for permission again at a later time.
          alert('else');
        }
      })
      .catch((e: any) => {
        alert('Error is' + e);
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
      this.qrReaderProvider.emitLoginData(this.scanned);
    } else if (this.typeOfQrCode === 'section') {
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
	} else if (this.typeOfQrCode === 'enrol') {
		data = safelyParseJSON(this.scanned);

		console.log('enroll methods instances data');
			console.log(data);
		this.enrolCourse = this.coursesProvider.getCourse(data.courseId).then(() => {
			console.log('enroll methodsthis.enrolCourse');
			console.log(this.enrolCourse);
		this.getCourse().then(() => {
			console.log('enroll methods instances');
			console.log(this.selfEnrolInstances);
		});
		});
		
	}
  }

  /**
   * Self enrol in a course.
   *
   * @param {string} password Password to use.
   * @param {number} instanceId The instance ID.
   * @return {Promise<any>} Promise resolved when self enrolled.
   */
  selfEnrolInCourse(password: string, instanceId: number): Promise<any> {
    const modal = this.domUtils.showModalLoading('core.loading', true);

    return this.coursesProvider
      .selfEnrol(this.enrolCourse.id, password, instanceId)
      .then(() => {
        // Close modal and refresh data.
        // this.isEnrolled = true;
        this.dataLoaded = false;

        // Sometimes the list of enrolled courses takes a while to be updated. Wait for it.
        this.waitForEnrolled(true).then(() => {
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
          //   // Invalid password, show the modal to enter the password.
          //   this.selfEnrolModal.present();
          //   this.currentInstanceId = instanceId;
          //   if (!password) {
          //     // No password entered, don't show error.
          //     return;
          //   }
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
        return this.coursesProvider.getUserCourse(this.enrolCourse.id);
      })
      .catch(() => {
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
            // The user is not enrolled in the course. Use getCourses to see if it's an admin/manager and can see the course.
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
}
