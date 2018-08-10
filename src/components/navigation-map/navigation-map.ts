import { NavigationMapProvider } from './../../providers/navigation-map-provider';
import { QrReaderProvider } from './../../providers/qrReader';
import { NavigationFloorsPage } from './../navigation-floors/navigation-floors';
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

import { Component, Injector, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CoreCourseProvider } from '@core/course/providers/course';
import { AddonModPageProvider } from '@addon/mod/page/providers/page';
import { CoreCourseModuleMainResourceComponent } from '@core/course/classes/main-resource-component';
import { CoreAppProvider } from '@providers/app';
import { AddonModPageHelperProvider } from '@addon/mod/page/providers/helper';
import { AddonModPagePrefetchHandler } from '@addon/mod/page/providers/prefetch-handler';
import { NavController } from 'ionic-angular';
import { safelyParseJSON } from '../../helpers/navigation_helpers';



@Component({
    selector: 'core-navigation-map',
    templateUrl: 'navigation-map.html'
})
export class NavigationMapComponent extends CoreCourseModuleMainResourceComponent implements OnChanges {
    @Input() data: any; // all data for the courses

    canGetPage: boolean;
    contents: any;
    image: string;
    childPages: string[];
    childrenList: string;
    childSections: string[];
    description: string;
    screen_to_show: string;
    descriptionInParagraphsArray: string[];
    mapsArray: number;
    // modulesArray: any; //to iterate and load the contents of all
    modulesContentArray: any = [];
    

    constructor(injector: Injector, private pageProvider: AddonModPageProvider,
        private courseProvider: CoreCourseProvider, private appProvider: CoreAppProvider,
        private pageHelper: AddonModPageHelperProvider, private pagePrefetch: AddonModPagePrefetchHandler,
        private navCtrl: NavController,
        private navigationMapProvider: NavigationMapProvider) {
        super(injector);
        this.childPages = new Array();
        this.childSections = new Array();
    }

    ngOnInit(): void {
        super.ngOnInit();
        // this.loadContent().then(() => {
        //     this.pageProvider.logView(this.module.instance).then(() => {
        //         this.courseProvider.checkModuleCompletion(this.courseId, this.module.completionstatus);
        //     });
        // });

    }


    howManyMapsAndWhereAreThey() {
        console.log('this.data in howManyMapsAndWhereAreThey');
        console.log(this.data);
        let i: number = 0, nameJsonString: string, nameJsonObjectArray = [], mapAmountArray, startForSubstring: number, endForSubstring: number;
        const generalModules = this.data.sections[1].modules; //general has to be here;
        for (i; i < generalModules.length; i++) {
            console.log('generalModules[i].name');
            console.log(generalModules[i].name);
            console.log("generalModules[i].name.indexOf({)");
            console.log(generalModules[i].name.indexOf('{'));
            console.log('generalModules[i].name.indexOf("}") + 1');
            console.log(generalModules[i].name.indexOf('}') + 1);
            startForSubstring = generalModules[i].name.indexOf('{');
            endForSubstring = generalModules[i].name.indexOf('}') + 1;
            nameJsonObjectArray[i] = {};
            
            if (startForSubstring === 0 && endForSubstring !== -1) {
                nameJsonString = generalModules[i].name.substring(startForSubstring, endForSubstring);
                console.log('nameJsonString in howManyMapsAndWhereAreThey');
                console.log(nameJsonString);
                
                nameJsonObjectArray[i].jsonObject = safelyParseJSON(nameJsonString);
                nameJsonObjectArray[i].index = i;

            } else {
                nameJsonObjectArray[i].jsonObject = {room: "forFilter"};
            }
            
        }

       
        
        mapAmountArray = nameJsonObjectArray.filter(nameJsonObject => {
            return !(nameJsonObject.jsonObject.room && nameJsonObject.jsonObject.room !== 'undefined'); //if the name object has room property its not only a map / We only want to have map object
        });
        console.log('mapAmountArray');
        console.log(mapAmountArray.length);
        console.log(mapAmountArray);


        return mapAmountArray;
    }

    ngOnChanges(changes: SimpleChanges) {
        let i = 0, modulesArray;
        console.log('changes');
        console.log(changes);
        console.log('this.data in navigation');
        console.log(this.data);
        if (changes.data.firstChange === true) {
            this.navigationMapProvider.setCourseData(this.data);
            this.mapsArray = this.howManyMapsAndWhereAreThey();
            modulesArray = this.createMapsModulesArray();
            // this.loadContent().then(() => {
            //     this.pageProvider.logView(this.module.instance).then(() => {
            //         this.courseProvider.checkModuleCompletion(this.courseId, this.module.completionstatus);
            //     });
            // });
            
            // for (i; i < this.modulesArray.length; i++ ) {
            //     this.module = this.modulesArray[0];
            //     this.loadContent().then(() => {
            //         // if (i < (this.modulesArray.length - 1)) {
            //         //     this.module = this.modulesArray[i + 1];//TODO: check this
            //         // }
            //         this.pageProvider.logView(this.module.instance).then(() => {
            //             this.courseProvider.checkModuleCompletion(this.courseId, this.module.completionstatus);
            //         });
            //     });
            // };
            this.asyncLoop(i, modulesArray);
        }
        



    }
    
    /**
     * Create an Array with the whole modules contains maps to iterate to load the content.
     *
     */
    createMapsModulesArray() {
        let indizesArray = this.howManyMapsAndWhereAreThey(), i: number = 0, modulesArray = [];
        console.log('indizesArray');
        console.log(indizesArray);
        console.log('i');
        console.log(i);

        for (i; i < indizesArray.length; i++) {
            console.log('this.data.sections[1].modules[indizesArray[i].index]');
            console.log(this.data.sections[1].modules[indizesArray[i].index]);
            modulesArray[i] = this.data.sections[1].modules[indizesArray[i].index];
            console.log('modulesArray[i]');
            console.log(modulesArray[i]);
        }
        console.log('modulesArray');
        console.log(modulesArray);
        return modulesArray;

    }

    /**
     * Download page contents.
     *
     * @param {boolean} [refresh] Whether we're refreshing data.
     * @return {Promise<any>} Promise resolved when done.
     */
    protected fetchContent(refresh?: boolean): Promise<any> {
        let downloadFailed = false;
        console.log('this.module in fetch');
        console.log(this.module);

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
                console.log('this.module.id getPagePromise if');
                console.log(this.module.id);
            } else {
                getPagePromise = this.courseProvider.getModule(this.module.id, this.courseId);
                console.log('this.module.id getPagePromise else');
                console.log(this.module.id);
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
                this.modulesContentArray.push(content);

                // this.parseDataFromPageContent(content);
                console.log('content');
                console.log(content);

                if (downloadFailed && this.appProvider.isOnline()) {
                    // We could load the main file but the download failed. Show error message.
                    this.domUtils.showErrorModal('core.errordownloadingsomefiles', true);
                }
            }));

            return Promise.all(promises);
        });
    }

    private parseDataFromPageContent(content: string): void {
        // Retrieve the navigation map data from the HTML content
        console.log('content');
        console.log(content);
        let imageTag = content.substring(content.indexOf('<img'));
        console.log('imageTag');
        console.log(imageTag);
        imageTag = imageTag.substring(0, imageTag.indexOf('>') + 1);
        console.log('imageTag');
        console.log(imageTag);
        this.image = imageTag;

        let childList = content.substring(content.indexOf('<ol>') + 4);
        console.log('childList');
        console.log(childList);
        childList = childList.substring(0, childList.indexOf('</ol>'));
        console.log('childList');
        console.log(childList);
        this.childrenList = childList;

        let description = content.substring(content.indexOf('</ol>') + 5);
        this.descriptionInParagraphsArray = description.split('/<p>|</p>/');
        console.log('description');
        console.log(description);
        console.log('this.descriptionInParagraphsArray');
        console.log(this.descriptionInParagraphsArray);
        this.description = description;

        const tokens = childList.split('</li>');
        console.log('tokens');
        console.log(tokens);
        for (let token of tokens) {
            if (token.includes('/mod/page/')) {
                token = token.substring(token.indexOf('php?id='));
                console.log('token');
                console.log(token);
                token = token.substring(token.indexOf('=') + 1, token.indexOf('>') - 1);
                console.log('token');
                console.log(token);
                this.childPages.push(token);
            } else if (token.includes('/course/view.php')) {
                token = token.substring(token.indexOf('php?id='));
                console.log('token');
                console.log(token);
                token = token.substring(token.indexOf('#') + 1, token.indexOf('>') - 1);
                console.log('token');
                console.log(token);
                this.childSections.push(token);
            }
        }

    }
    async asyncLoop(i, arrayToLoop) {
        for (i; i < arrayToLoop.length; i++ ) {
            this.module = arrayToLoop[i];
                console.log('this.module in asyncloop');
                console.log(this.module);
            await this.loadContent().then(() => {
                // if (i < (this.modulesArray.length - 1)) {
                //     this.module = this.modulesArray[i + 1];//TODO: check this
                // }
                console.log('loadcontent then');
                this.pageProvider.logView(this.module.instance).then(() => {
                    this.courseProvider.checkModuleCompletion(this.courseId, this.module.completionstatus);
                });
            });
        };
    }

    startTourNavigateToFloor() {
        this.navCtrl.push(
            NavigationFloorsPage,
            {
                mapsArray: this.mapsArray
            }
        );
    }

}
