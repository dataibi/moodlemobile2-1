// (C) Copyright 2018 Jens-Michael Lohse
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
import { Component, Injector } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { CoreCourseModulePrefetchDelegate } from './../../providers/module-prefetch-delegate';
import { CoreTextUtilsProvider } from './../../../../providers/utils/text';
import { CoreCoursesProvider } from './../../../courses/providers/courses';
import { CoreCourseHelperProvider } from './../../providers/helper';
import { CoreCourseOptionsDelegate, CoreCourseOptionsHandlerToDisplay } from './../../providers/options-delegate';
import { CoreCourseFormatDelegate } from './../../providers/format-delegate';
import { CoreDomUtilsProvider } from './../../../../providers/utils/dom';
import { CoreCourseProvider } from './../../providers/course';

@Component({
	selector: 'nav-map-wrapper',
	templateUrl: 'nav-map-wrapper.html'
})
export class NavigationMapWrapperPage {
	module;
	course;
	data;
	sections: any[];
	courseHandlers: CoreCourseOptionsHandlerToDisplay[];
	displayRefresher: boolean = true;
	title: string;

	constructor(public navCtrl: NavController, navParams: NavParams,
			private courseProvider: CoreCourseProvider, private domUtils: CoreDomUtilsProvider,
            private courseFormatDelegate: CoreCourseFormatDelegate, private courseOptionsDelegate: CoreCourseOptionsDelegate,
            private translate: TranslateService, private courseHelper: CoreCourseHelperProvider,
            private textUtils: CoreTextUtilsProvider, private coursesProvider: CoreCoursesProvider,
            private injector: Injector,
            private prefetchDelegate: CoreCourseModulePrefetchDelegate) {
		this.module = navParams.get('module');
		this.course = navParams.get('course');
		this.data = navParams.get('data');
	}

	navToProfile(): void {
		this.navCtrl.push('CoreMainMenuMorePage');
	}

    /**
     * Refresh the data.
     *
     * @param  {any} [refresher] Refresher.
     * @return {Promise<any>} Promise resolved when done.
     */
    doRefresh(refresher?: any): Promise<any> {
        return this.invalidateData().finally(() => {
            return this.loadData(true).finally(() => {
                    refresher && refresher.complete();
            });
        });
	}

    /**
     * Invalidate the data.
     */
    protected invalidateData(): Promise<any> {
        const promises = [];

        promises.push(this.courseProvider.invalidateSections(this.course.id));
        promises.push(this.coursesProvider.invalidateUserCourses());
        promises.push(this.courseFormatDelegate.invalidateData(this.course, this.sections));
        promises.push(this.coursesProvider.invalidateCoursesByField('id', this.course.id));

        if (this.sections) {
            promises.push(this.prefetchDelegate.invalidateCourseUpdates(this.course.id));
        }

        return Promise.all(promises);
	}

    /**
     * Fetch and load all the data required for the view.
     */
    protected loadData(refresh?: boolean): Promise<any> {
        // First of all, get the course because the data might have changed.
        return this.coursesProvider.getUserCourse(this.course.id).catch(() => {
            // Error getting the course, probably guest access.
        }).then((course) => {
            const promises = [];
            let promise;

            if (course) {
                this.course = course;
            }

            // Get the completion status.
            if (this.course.enablecompletion === false) {
                // Completion not enabled.
                promise = Promise.resolve({});
            } else {
                promise = this.courseProvider.getActivitiesCompletionStatus(this.course.id).catch(() => {
                    // It failed, don't use completion.
                    return {};
                });
            }

            promises.push(promise.then((completionStatus) => {
                // Get all the sections.
                return this.courseProvider.getSections(this.course.id, false, true).then((sections) => {
                    if (refresh) {
                        // Invalidate the recently downloaded module list. To ensure info can be prefetched.
                        const modules = this.courseProvider.getSectionsModules(sections);

                        return this.prefetchDelegate.invalidateModules(modules, this.course.id).then(() => {
                            return sections;
                        });
                    } else {
                        return sections;
                    }
                }).then((sections) => {

                    this.courseHelper.addHandlerDataForModules(sections, this.course.id, completionStatus);

                    // Format the name of each section and check if it has content.
                    this.sections = sections.map((section) => {
                        this.textUtils.formatText(section.name.trim(), true, true).then((name) => {
                            section.formattedName = name;
                        });
                        section.hasContent = this.courseHelper.sectionHasContent(section);

                        return section;
                    });

                    if (this.courseFormatDelegate.canViewAllSections(this.course)) {
                        // Add a fake first section (all sections).
                        this.sections.unshift({
                            name: this.translate.instant('core.course.allsections'),
                            id: CoreCourseProvider.ALL_SECTIONS_ID,
                            hasContent: true
                        });
                    }

                    // Get the title again now that we have sections.
                    this.title = this.courseFormatDelegate.getCourseTitle(this.course, this.sections);

                    // Get whether to show the refresher now that we have sections.
                    this.displayRefresher = this.courseFormatDelegate.displayRefresher(this.course, this.sections);
                });
            }));

            // Get the overview files.
            if (this.course.overviewfiles) {
                this.course.imageThumb = this.course.overviewfiles[0] && this.course.overviewfiles[0].fileurl;
            } else if (this.coursesProvider.isGetCoursesByFieldAvailable()) {
                promises.push(this.coursesProvider.getCoursesByField('id', this.course.id).then((coursesInfo) => {
                    if (coursesInfo[0] && coursesInfo[0].overviewfiles && coursesInfo[0].overviewfiles[0]) {
                        this.course.imageThumb = coursesInfo[0].overviewfiles[0].fileurl;
                    } else {
                        this.course.imageThumb = false;
                    }
                }));
            }

            // Load the course handlers.
            promises.push(this.courseOptionsDelegate.getHandlersToDisplay(this.injector, this.course, refresh, false)
                    .then((handlers) => {
                // Add the courseId to the handler component data.
                handlers.forEach((handler) => {
                    handler.data.componentData = handler.data.componentData || {};
                    handler.data.componentData.courseId = this.course.id;
                });

                this.courseHandlers = handlers;
            }));

            return Promise.all(promises).catch((error) => {
                this.domUtils.showErrorModalDefault(error, 'core.course.couldnotloadsectioncontent', true);
            });
        });
	}

    /**
     * User entered the page.
     */
    ionViewWillEnter(): void {
        this.invalidateData().finally(() => {
            this.loadData(true);
        });
	}
}
