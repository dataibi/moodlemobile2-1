// (C) Copyright 2015 Martin Dougiamas
// Modifications copyright (C) 2018 REVEAL
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

import { Component, Input, OnInit } from '@angular/core';
import { CoreCourseProvider } from '../../providers/course';
import { CoreCourseModuleDelegate } from '../../providers/module-delegate';
import { CoreSitesProvider } from '@providers/sites';
import { CoreConfigConstants } from '../../../../configconstants';

/**
 * Component that displays info about an unsupported module.
 */
@Component({
    selector: 'core-course-unsupported-module',
    templateUrl: 'core-course-unsupported-module.html',
})
export class CoreCourseUnsupportedModuleComponent implements OnInit {
    @Input() course: any; // The course to module belongs to.
    @Input() module: any; // The module to render.

    isDisabledInSite: boolean;
    isSupportedByTheApp: boolean;
    moduleName: string;
    url;
    loaded: boolean = false;
    iframeDivWrapperWidth: number = 100;

	protected AB_TABLE = 'abuser';

    constructor(private courseProvider: CoreCourseProvider,
        private moduleDelegate: CoreCourseModuleDelegate,
        private sitesProvider: CoreSitesProvider) {
     }

    /**
     * Component being initialized.
     */
    ngOnInit(): void {
        this.isDisabledInSite = this.moduleDelegate.isModuleDisabledInSite(this.module.modname);
        this.isSupportedByTheApp = this.moduleDelegate.hasHandler(this.module.modname);
        this.moduleName = this.courseProvider.translateModuleName(this.module.modname);

        const siteId = this.sitesProvider.getCurrentSiteId();
        this.sitesProvider.getSite(siteId)
            .then((site) => {

                return site.getDb().getRecords(this.AB_TABLE);
            })
            .then((value) => {
                this.url = CoreConfigConstants.proxyurl + '?username='
                + value[0].username + '&password=' + value[0].password + '&redir='
                + this.module.url;
                this.loaded = true;
            }
        );
    }

    iframeResizer(mode: string): void {
        if (mode === 'smaller') {
            if (this.iframeDivWrapperWidth > 100) {
                this.iframeDivWrapperWidth -= 30;
            }
        } else if (mode === 'bigger') {
            if (this.iframeDivWrapperWidth < 250) {
                this.iframeDivWrapperWidth += 30;
            }
        }
    }

    // TODO: missing nav to Barcodesanner button here but need course for it
}
