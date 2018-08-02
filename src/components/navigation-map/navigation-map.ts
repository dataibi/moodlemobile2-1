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
import { CoreCourseProvider } from '@core/course/providers/course';
import { AddonModPageProvider } from '@addon/mod/page/providers/page';
import { CoreCourseModuleMainResourceComponent } from '@core/course/classes/main-resource-component';
import { CoreAppProvider } from '@providers/app';
import { AddonModPageHelperProvider } from '@addon/mod/page/providers/helper';
import { AddonModPagePrefetchHandler } from '@addon/mod/page/providers/prefetch-handler';

@Component({
    selector: 'core-navigation-map',
    templateUrl: 'navigation-map.html',
})
export class NavigationMapComponent extends CoreCourseModuleMainResourceComponent {

    canGetPage: boolean;
    contents: any;
    image: string;
    childPages: string[];
    childrenList: string;
    childSections: string;
    description: string;

    constructor(injector: Injector, private pageProvider: AddonModPageProvider,
        private courseProvider: CoreCourseProvider, private appProvider: CoreAppProvider,
        private pageHelper: AddonModPageHelperProvider, private pagePrefetch: AddonModPagePrefetchHandler) {
        super(injector);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.loadContent().then(() => {
            this.pageProvider.logView(this.module.instance).then(() => {
                this.courseProvider.checkModuleCompletion(this.courseId, this.module.completionstatus);
            });
        });

    }

    /**
     * Download page contents.
     *
     * @param {boolean} [refresh] Whether we're refreshing data.
     * @return {Promise<any>} Promise resolved when done.
     */
    protected fetchContent(refresh?: boolean): Promise<any> {
        let downloadFailed = false;

        // Download content. This function also loads module contents if needed.
        return this.pagePrefetch.download(this.module, this.courseId).catch(() => {
            // Mark download as failed but go on since the main files could have been downloaded.
            downloadFailed = true;
        }).then(() => {
            if (!this.module.contents.length) {
                // Try to load module contents for offline usage.
                return this.courseProvider.loadModuleContents(this.module, this.courseId);
            }
        }).then(() => {
            const promises = [];

            let getPagePromise;

            // Get the module to get the latest title and description. Data should've been updated in download.
            if (this.canGetPage) {
                getPagePromise = this.pageProvider.getPageData(this.courseId, this.module.id);
            } else {
                getPagePromise = this.courseProvider.getModule(this.module.id, this.courseId);
            }

            promises.push(getPagePromise.then((page) => {
                if (page) {
                    this.description = page.intro || page.description;
                    this.dataRetrieved.emit(page);
                }
            }).catch(() => {
                // Ignore errors.
            }));

            // Get the page HTML.
            promises.push(this.pageHelper.getPageHtml(this.module.contents, this.module.id).then((content) => {
                // All data obtained, now fill the context menu.
                this.fillContextMenu(refresh);

                this.contents = content;

                // Retrieve the navigation map data from the HTML content
                let imageTag = content.substring(content.indexOf('<img'));
                imageTag = imageTag.substring(0, imageTag.indexOf('>') + 1);
                this.image = imageTag;

                let childList = content.substring(content.indexOf('<ol>') + 4);
                childList = childList.substring(0, childList.indexOf('</ol>'));
                this.childrenList = childList;

                this.childPages = childList.split('</li>');

                let description = content.substring(content.indexOf('</ol>') + 5);
                this.description = description;

                if (downloadFailed && this.appProvider.isOnline()) {
                    // We could load the main file but the download failed. Show error message.
                    this.domUtils.showErrorModal('core.errordownloadingsomefiles', true);
                }
            }));

            return Promise.all(promises);
        });
    }

}
