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
import { NavigationMapProvider } from "./../../providers/navigation-map-provider";
import { NavigationFloorsPage } from "./../navigation-floors/navigation-floors";

import {
    Component,
    Injector,
    Input,
    OnChanges,
    SimpleChanges,
    Optional,
    ElementRef
} from "@angular/core";
import { CoreCourseProvider } from "@core/course/providers/course";
import { AddonModPageProvider } from "@addon/mod/page/providers/page";
import { CoreCourseModuleMainResourceComponent } from "@core/course/classes/main-resource-component";
import { CoreAppProvider } from "@providers/app";
import { AddonModPageHelperProvider } from "@addon/mod/page/providers/helper";
import { AddonModPagePrefetchHandler } from "@addon/mod/page/providers/prefetch-handler";
import { NavController, Content, Platform } from "ionic-angular";
import { safelyParseJSON } from "../../helpers/navigation_helpers";
import { CoreSitesProvider } from "@providers/sites";
import { CoreUtilsProvider } from "@providers/utils/utils";
import { CoreSite } from "@classes/site";
import { CoreLinkDirective } from "@directives/link";
import { CoreUrlUtilsProvider } from "@providers/utils/url";
import { CoreContentLinksHelperProvider } from "@core/contentlinks/providers/helper";
import { CoreExternalContentDirective } from "@directives/external-content";
import { CoreLoggerProvider } from "@providers/logger";
import { CoreFilepoolProvider } from "@providers/filepool";
import { trigger, transition, animate, style } from '@angular/animations'

@Component({
    selector: "core-navigation-map",
    templateUrl: "navigation-map.html",
    animations: [
        trigger('slideInOut', [
          transition(':enter', [
            style({transform: 'translateY(-100%)'}),
            animate('200ms ease-in', style({transform: 'translateY(0%)'}))
          ]),
          transition(':leave', [
            animate('200ms ease-in', style({transform: 'translateY(-100%)'}))
          ])
        ])
      ]
})
export class NavigationMapComponent
    extends CoreCourseModuleMainResourceComponent
    implements OnChanges {
    @Input()
    data: any; // all data for the courses
    mapIndexToShow: number = 0;
    roomIndexToShow: number = 0;
    topicIndexToShow: number = 0;
    showRoomDescription: boolean = false;
    showExponatDescription: boolean = false;
    canGetPage: boolean;
    contents: any;
    image: string;
    childPages: string[];
    childrenList: string;
    childSections: string[];
    description: string;
    screen_to_show: string;
    descriptionInParagraphsArray: string[];
    modulesContentArray: any = []; //the UNsplitted content of the modules as one html string and images with remote url
    modulesSplittedContentArray: any[] = []; //the splitted content of the modules but images with remote url (hotspot coordinates are here) !!reserved for the maps only!!
    siteId;
    clean: boolean = false;
    singleLine: boolean = false;
    adaptImg;
    roomModulesSplittedContentArray: any = []; // Only for the rooms
    hotspotsLoaded = false;
    isMapInThisProject: boolean = true;
    roomMapToShow: number = 0;
    visible: boolean = false;

    protected element: HTMLElement;

    constructor(
        injector: Injector,
        private pageProvider: AddonModPageProvider,
        private courseProvider: CoreCourseProvider,
        private appProvider: CoreAppProvider,
        private pageHelper: AddonModPageHelperProvider,
        private pagePrefetch: AddonModPagePrefetchHandler,
        private navCtrl: NavController,
        private navigationMapProvider: NavigationMapProvider,
        private sitesProvider: CoreSitesProvider,
        private utils: CoreUtilsProvider,
        private urlUtils: CoreUrlUtilsProvider,
        private contentLinksHelper: CoreContentLinksHelperProvider,
        private loggerProvider: CoreLoggerProvider,
        private filepoolProvider: CoreFilepoolProvider,
        private platform: Platform,
        element: ElementRef,
        @Optional() private content: Content
    ) {
        super(injector);
        this.childPages = new Array();
        this.childSections = new Array();
        this.element = element.nativeElement;
        this.element.classList.add("opacity-hide"); // Hide contents until they're treated.
    }

    ngOnInit(): void {
        super.ngOnInit();
    }

    /**
     * Create an Array with the whole modules contains maps to iterate to load the content.
     *
     * @return {object} With the maps and the index of them.
     */
    howManyMapsAndWhereAreThey(mapIndex, whatContent): any[] {
        console.log("this.data in howManyMapsAndWhereAreThey");
        console.log(this.data);

        let i: number = 0,
            nameJsonString: string,
            nameJsonObjectArray = [],
            mapAmountArray,
            startForSubstring: number,
            endForSubstring: number;
        const generalModules = this.data.sections[1].modules; //general has to be here;
        for (i; i < generalModules.length; i++) {
            console.log("generalModules[i].name");
            console.log(generalModules[i].name);
            console.log("generalModules[i].name.indexOf({)");
            console.log(generalModules[i].name.indexOf("{"));
            console.log('generalModules[i].name.indexOf("}") + 1');
            console.log(generalModules[i].name.indexOf("}") + 1);
            startForSubstring = generalModules[i].name.indexOf("{");
            endForSubstring = generalModules[i].name.indexOf("}") + 1;
            nameJsonObjectArray[i] = {};

            if (startForSubstring === 0 && endForSubstring !== -1) {
                nameJsonString = generalModules[i].name.substring(
                    startForSubstring,
                    endForSubstring
                );
                console.log("nameJsonString in howManyMapsAndWhereAreThey");
                console.log(nameJsonString);

                nameJsonObjectArray[i].jsonObject = safelyParseJSON(
                    nameJsonString
                );
                nameJsonObjectArray[i].index = i;
            } else {
                nameJsonObjectArray[i].jsonObject = { room: "forFilter" }; // Delete this row?
            }
        }

        console.log("nameJsonObjectArray");
        console.log(nameJsonObjectArray);

        switch (whatContent) {
            case "map":
                mapAmountArray = nameJsonObjectArray.filter(nameJsonObject => {
                    return !(
                        nameJsonObject.jsonObject.room &&
                        typeof nameJsonObject.jsonObject.room !== "undefined"
                    ); //if the name object has room property its not only a map / We only want to have map object
                });
                break;
            case "rooms":
                mapAmountArray = nameJsonObjectArray.filter(nameJsonObject => {
                    if(this.isMapInThisProject === true) {
                        return (
                            nameJsonObject.jsonObject.room &&
                            typeof nameJsonObject.jsonObject.room !== "undefined" &&
                            nameJsonObject.jsonObject.room !== 'forFilter' &&
                            nameJsonObject.jsonObject.map === mapIndex + 1
                        );
                    } else {
                        return (
                            nameJsonObject.jsonObject.room &&
                            typeof nameJsonObject.jsonObject.room !== "undefined" &&
                            nameJsonObject.jsonObject.room !== 'forFilter'
                        );
                    }
                    
                });
                break;
            // case "exponats":
            //     mapAmountArray = nameJsonObjectArray.filter(nameJsonObject => {
            //         return (
            //             nameJsonObject.jsonObject.room &&
            //             nameJsonObject.jsonObject.room !== "undefined" &&
            //             nameJsonObject.jsonObject.room === this.roomIndexToShow &&
            //             nameJsonObject.jsonObject.map === mapIndex + 1
            //         );
            //     });
            //     break;
            default:
                mapAmountArray = nameJsonObjectArray.filter(nameJsonObject => {
                    return !(
                        nameJsonObject.jsonObject.room &&
                        typeof nameJsonObject.jsonObject.room !== "undefined"
                    ); //if the name object has room property its not only a map / We only want to have map object
                });
        }
        console.log("mapAmountArray");
        console.log(mapAmountArray.length);
        console.log(mapAmountArray);

        return mapAmountArray;
    }

    getTopicContentOfOneRoom(): Promise<object> {
        let sections: any[] = [], i = 0, promises: Promise<object>[] = [];

        //get the inizes of the topics of the room

        sections = this.data.sections.filter((oneSection, i) => {
            let jsonString: string,
                startForSubstring: number,
                endForSubstring: number,
                jsonStringObject: any;

            if (oneSection.section &&
                typeof oneSection.section !== 'undefined' &&
                oneSection.section != 0) {

                startForSubstring = oneSection.summary.indexOf("{");
                endForSubstring = oneSection.summary.indexOf("}") + 1;

                jsonString = oneSection.summary.substring(
                    startForSubstring,
                    endForSubstring
                );

                jsonStringObject = safelyParseJSON(jsonString);

                if (jsonStringObject.map &&
                    typeof jsonStringObject.map !== 'undefined' &&
                    jsonStringObject.map === (this.mapIndexToShow + 1) &&
                    jsonStringObject.room &&
                    jsonStringObject.room !== 'undefined' &&
                    jsonStringObject.room === (this.roomIndexToShow + 1)) {



                    return true;
                } else {
                    return false;
                }
            }
            return false;
        });

        for (i; i < sections.length; i++) {
            promises.push(this.formatContents(sections[i].summary, sections[i].section));
        }
        return Promise.all(promises);
    }



    async ngOnChanges(changes: SimpleChanges) {
        let mapModulesArray,
            roomModulesArray,
            x = 0;
        if (changes.data.firstChange === true) {
            this.navigationMapProvider.setCourseData(this.data);
            mapModulesArray = this.createMapsModulesArray("map");
            if (mapModulesArray.length) {
                await this.createTheSplittedContentInArray(mapModulesArray, 'map');
            } else {
                this.isMapInThisProject = false;
            }

            roomModulesArray = this.createMapsModulesArray("rooms");
            console.log('roomModulesArray');
            console.log(roomModulesArray);
            this.createTheSplittedContentInArray(roomModulesArray, 'rooms');
        }
    }

    async createTheSplittedContentInArray(modulesArray, whatContent) {
        let x: number = 0;
        await this.asyncLoop(modulesArray, whatContent);
    }

    async asyncLoop(arrayToLoop, whatContent) {
        let i: number = 0;
        for (i; i < arrayToLoop.length; i++) {
            let fetchModule = arrayToLoop[i]; // What we want to have in this.fetchContent
            console.log("fetchModule in asyncloop");
            console.log(fetchModule);
            await this.loadContent(undefined, arrayToLoop[i], i, whatContent).then(() => {
                this.pageProvider.logView(fetchModule.instance).then(() => {
                    this.courseProvider.checkModuleCompletion(
                        this.courseId,
                        fetchModule.completionstatus
                    );
                });
            });
        }
        this.loaded = true;
        if (whatContent === 'rooms') {
            this.hotspotsLoaded = true;
        }
        this.refreshIcon = "refresh";
    }

    /**
     * Create an Array with the whole modules contains maps to iterate to load the content.
     *
     */
    createMapsModulesArray(whatContent) {
        let indizesArray = this.howManyMapsAndWhereAreThey(
            this.mapIndexToShow,
            whatContent
        ),
            i: number = 0,
            modulesArray = [];
        console.log("indizesArray");
        console.log(indizesArray);

        for (i; i < indizesArray.length; i++) {
            console.log("this.data.sections[1].modules[indizesArray[i].index]");
            console.log(this.data.sections[1].modules[indizesArray[i].index]);
            modulesArray[i] = this.data.sections[1].modules[
                indizesArray[i].index
            ];
            console.log("modulesArray[i]");
            console.log(modulesArray[i]);
        }
        console.log("modulesArray");
        console.log(modulesArray);
        return modulesArray;
    }

    /**
     * Loads the component contents and shows the corresponding error.
     *
     * @param {boolean} [refresh] Whether we're refreshing data.
     * @return {Promise<any>} Promise resolved when done.
     */
    protected loadContent(
        refresh?: boolean,
        fetchModule?,
        index?,
        whatContent?
    ): Promise<any> {
        return this.fetchContent(refresh, fetchModule)
            .catch(error => {
                // Error getting data, fail.
                this.domUtils.showErrorModalDefault(
                    error,
                    this.fetchContentDefaultError,
                    true
                );
            })
            .then(promiseall => {

                let { formattedContent, content } = promiseall[promiseall.length - 1];
                console.log("formattedContent");
                console.log(formattedContent);
                this.parseDataFromPageContent(
                    index,
                    // this.modulesContentArray[index],
                    content,
                    fetchModule.name,
                    formattedContent,
                    whatContent
                ); // The name is not in the content, so we pass it here, too
            })
            .finally(() => {

            });
    }

    /**
     * Download page contents.
     *
     * @param {boolean} [refresh] Whether we're refreshing data.
     * @return {Promise<any>} Promise resolved when done.
     */
    protected fetchContent(refresh?: boolean, fetchModule?): Promise<any> {
        let downloadFailed = false,
            index: number = 0;
        console.log("fetchModule in fetch");
        console.log(fetchModule);

        // Download content. This function also loads fetchModule contents if needed.
        return this.pagePrefetch
            .download(fetchModule, this.courseId)
            .catch(() => {
                // Mark download as failed but go on since the main files could have been downloaded.
                downloadFailed = true;
            })
            .then(() => {
                if (!fetchModule.contents.length) {
                    // Try to load module contents for offline usage.
                    return this.courseProvider.loadModuleContents(
                        fetchModule,
                        this.courseId
                    );
                }
            })
            .then(() => {
                const promises = [];

                let getPagePromise;

                // Get the fetchModule to get the latest title and description. Data should've been updated in download.
                if (this.canGetPage) {
                    getPagePromise = this.pageProvider.getPageData(
                        this.courseId,
                        fetchModule.id
                    );
                    console.log("fetchModule.id getPagePromise if");
                    console.log(fetchModule.id);
                } else {
                    getPagePromise = this.courseProvider.getModule(
                        fetchModule.id,
                        this.courseId
                    );
                    console.log("fetchModule.id getPagePromise else");
                    console.log(fetchModule.id);
                }

                promises.push(
                    getPagePromise
                        .then(page => {
                            if (page) {
                                this.description =
                                    page.intro || page.description;
                                this.dataRetrieved.emit(page);
                            }
                        })
                        .catch(() => {
                            // Ignore errors.
                        })
                );

                // Get the page HTML.
                promises.push(
                    this.pageHelper
                        .getPageHtml(fetchModule.contents, fetchModule.id)
                        .then(content => {
                            // All data obtained, now fill the context menu.
                            this.fillContextMenu(refresh);

                            this.contents = content;
                            content
                            // this.modulesContentArray.push(content);

                            // // this.parseDataFromPageContent(content);
                            // console.log("this.modulesContentArray");
                            // console.log(this.modulesContentArray);

                            if (downloadFailed && this.appProvider.isOnline()) {
                                // We could load the main file but the download failed. Show error message.
                                this.domUtils.showErrorModal(
                                    "core.errordownloadingsomefiles",
                                    true
                                );
                            }
                            return content;
                        })
                        .then((content) => {
                            return this.formatContents(content);
                        })
                );
                return Promise.all(promises);
            });
    }

    private parseDataFromPageContent(i, content: any, name, formattedContent, whatContent?) {
        let childList: string,
            description: string,
            hotspotForAscendingRooms = [],
            hotspotForAscendingRoomsSegments = [],
            splittedName,
            isHotspots: number;

            console.log('content in parse');
            console.log(content);

            childList = content.substring(content.indexOf("<ol>") + 4);
            console.log("childList");
            console.log(childList);
            childList = childList.substring(0, childList.indexOf("</ol>"));
            console.log("childList");
            console.log(childList);

            hotspotForAscendingRoomsSegments = childList.split("</li>");
            hotspotForAscendingRoomsSegments.splice(-1, 1); // remove last emtpy element
            console.log("hotspotForAscendingRoomsSegments");
            console.log(hotspotForAscendingRoomsSegments);
            hotspotForAscendingRooms = hotspotForAscendingRoomsSegments.map(
                segment => {
                    let hotspotXYcoordinates: any = {}, xStart: number;
                    xStart = segment.indexOf("x-value:");
                    if (xStart === -1) {
                        return hotspotXYcoordinates;
                    }
                    hotspotXYcoordinates.xValue = segment.substring(
                        xStart + 8,
                        segment.indexOf("y-value") - 2
                    );
                    hotspotXYcoordinates.yValue = segment.substring(
                        segment.indexOf("y-value:") + 8,
                        segment.indexOf(")")
                    );
                    return hotspotXYcoordinates;
                }
            );


            console.log("hotspotForAscendingRooms");
            console.log(hotspotForAscendingRooms);
        


        // const tokens = childList.split("</li>");
        // console.log("tokens");
        // console.log(tokens);
        // for (let token of tokens) {
        //     if (token.includes("/mod/page/")) {
        //         token = token.substring(token.indexOf("php?id="));
        //         console.log("token");
        //         console.log(token);
        //         token = token.substring(
        //             token.indexOf("=") + 1,
        //             token.indexOf(">") - 1
        //         );
        //         console.log("token");
        //         console.log(token);
        //         this.modulesSplittedContentArray[i].childPages = [];
        //         this.modulesSplittedContentArray[i].childPages.push(token);
        //     } else if (token.includes("/course/view.php")) {
        //         token = token.substring(token.indexOf("php?id="));
        //         console.log("token");
        //         console.log(token);
        //         token = token.substring(
        //             token.indexOf("#") + 1,
        //             token.indexOf(">") - 1
        //         );
        //         console.log("token");
        //         console.log(token);
        //         this.modulesSplittedContentArray[i].childSections.push(token);
        //     }
        // }


        description = content.substring(content.indexOf("</ol>") + 5);

        console.log("description");
        console.log(description);

        splittedName = name.split("} ");


        if (whatContent === 'map') {
            this.modulesSplittedContentArray[i] = {};
            this.modulesSplittedContentArray[i].childrenList = isHotspots !== -1 ? childList : '';
            this.modulesSplittedContentArray[i].hotspotsCoordinates = Object.keys(hotspotForAscendingRooms[0]).length ? hotspotForAscendingRooms : [];
            this.modulesSplittedContentArray[i].description = description;
            this.modulesSplittedContentArray[i].descriptionInParagraphsArray = description.split("/<p>|</p>/");
            this.modulesSplittedContentArray[i].name = splittedName.slice(-1)[0];
            this.modulesSplittedContentArray[i].image = formattedContent.images[0].src;
            this.modulesSplittedContentArray[i].imageAlt = formattedContent.images[0].alt;
            console.log("this.modulesSplittedContentArray");
            console.log(this.modulesSplittedContentArray);
        } else if (whatContent === 'rooms') {
            this.roomModulesSplittedContentArray[i] = {};
            this.roomModulesSplittedContentArray[i].childrenList = isHotspots !== -1 ? childList : '';
            this.roomModulesSplittedContentArray[i].hotspotsCoordinates = Object.keys(hotspotForAscendingRooms[0]).length ? hotspotForAscendingRooms : [];
            this.roomModulesSplittedContentArray[i].image = formattedContent.images[0].src;
            this.roomModulesSplittedContentArray[i].descriptionInParagraphsArray = description.split("/<p>|</p>/");
            this.roomModulesSplittedContentArray[i].name = splittedName.slice(-1)[0];
            this.roomModulesSplittedContentArray[i].imageAlt = formattedContent.images[0].alt;
            console.log("this.roomModulesSplittedContentArray");
            console.log(this.roomModulesSplittedContentArray);
        }
    }

    /**
     * Apply formatText and set sub-directives.
     *
     * @return {Promise<HTMLElement>} Promise resolved with a div element containing the code.
     */
    protected formatContents(content, sectionId = undefined): Promise<any> {
        let site: CoreSite,
            promises = [],
            formattedContent = {};
        // Retrieve the site since it might be needed later.
        return this.sitesProvider
            .getSite(this.siteId)
            .catch(() => {
                // Error getting the site. This probably means that there is no current site and no siteId was supplied.
            })
            .then((siteInstance: CoreSite) => {
                site = siteInstance;

                // Apply format text function.
                return this.textUtils.formatText(
                    // this.contents,
                    content,
                    this.utils.isTrueOrOne(this.clean),
                    this.utils.isTrueOrOne(this.singleLine)
                );
            })
            .then(formatted => {
                const div = document.createElement("div"),
                    canTreatVimeo =
                        site &&
                        site.isVersionGreaterEqualThan(["3.3.4", "3.4"]);
                let images, anchors, audios, videos, iframes, buttons;

                div.innerHTML = formatted;
                console.log("div.innerHTML");
                console.log(div.innerHTML);
                images = Array.from(div.querySelectorAll("img"));
                anchors = Array.from(div.querySelectorAll("a"));
                audios = Array.from(div.querySelectorAll("audio"));
                videos = Array.from(div.querySelectorAll("video"));
                iframes = Array.from(div.querySelectorAll("iframe"));
                buttons = Array.from(div.querySelectorAll(".button"));

                // Walk through the content to find the links and add our directive to it.
                // Important: We need to look for links first because in 'img' we add new links without core-link.
                anchors.forEach(anchor => {
                    // Angular 2 doesn't let adding directives dynamically. Create the CoreLinkDirective manually.
                    const linkDir = new CoreLinkDirective(
                        anchor,
                        this.domUtils,
                        this.utils,
                        this.sitesProvider,
                        this.urlUtils,
                        this.contentLinksHelper,
                        this.navCtrl,
                        this.content
                    );
                    linkDir.capture = true;
                    linkDir.ngOnInit();

                    this.addExternalContent(anchor);
                });

                if (images && images.length > 0) {
                    // If cannot calculate element's width, use a medium number to avoid false adapt image icons appearing.
                    const elWidth = this.getElementWidth(this.element) || 100;

                    // Walk through the content to find images, and add our directive.
                    // promise = await (function imagesLoop(): void | Promise<any> {
                    //     images.forEach((img: HTMLElement) => {
                    //         let prom;
                    //         this.addMediaAdaptClass(img);
                    //         prom = this.addExternalContent(img);
                    //         if (this.utils.isTrueOrOne(this.adaptImg)) {
                    //             this.adaptImage(elWidth, img);
                    //         }
                    //         return prom;
                    //     });
                    // })();
                    images.forEach(async (img: HTMLElement) => {
                        let promise;
                        this.addMediaAdaptClass(img);
                        promise = this.addExternalContent(img);
                        if (this.utils.isTrueOrOne(this.adaptImg)) {
                            this.adaptImage(elWidth, img);
                        }
                        promises.push(promise);
                    });
                }

                return Promise.all(promises).then(() => {
                    audios.forEach(audio => {
                        this.treatMedia(audio);
                    });

                    videos.forEach(video => {
                        this.treatVideoFilters(video);
                        this.treatMedia(video);
                    });

                    iframes.forEach(iframe => {
                        this.treatIframe(iframe, site, canTreatVimeo);
                    });

                    // Handle buttons with inner links.
                    buttons.forEach((button: HTMLElement) => {
                        // Check if it has a link inside.
                        if (button.querySelector("a")) {
                            button.classList.add("core-button-with-inner-link");
                        }
                    });
                    formattedContent["images"] = images;
                    formattedContent["anchors"] = anchors;
                    formattedContent["audios"] = audios;
                    formattedContent["videos"] = videos;
                    formattedContent["iframes"] = iframes;
                    formattedContent["buttons"] = buttons;
                    return Promise.resolve({ formattedContent: formattedContent, content: content, sectionId: sectionId });
                });
            });
    }

    /**
     * Apply CoreExternalContentDirective to a certain element.
     *
     * @param {HTMLElement} element Element to add the attributes to.
     */
    protected addExternalContent(element: HTMLElement): void | Promise<any> {
        // Angular 2 doesn't let adding directives dynamically. Create the CoreExternalContentDirective manually.
        const extContent = new CoreExternalContentDirective(
            <any>element,
            this.loggerProvider,
            this.filepoolProvider,
            this.platform,
            this.sitesProvider,
            this.domUtils,
            this.urlUtils,
            this.appProvider
        );

        extContent.component = this.component;
        extContent.componentId = this.componentId;
        extContent.siteId = this.siteId;

        return extContent.ngAfterViewInit();
    }

    /**
     * Returns the element width in pixels.
     *
     * @param {HTMLElement} element Element to get width from.
     * @return {number} The width of the element in pixels. When 0 is returned it means the element is not visible.
     */
    protected getElementWidth(element: HTMLElement): number {
        let width = this.domUtils.getElementWidth(element);

        if (!width) {
            // All elements inside are floating or inline. Change display mode to allow calculate the width.
            const parentWidth = this.domUtils.getElementWidth(
                element.parentNode,
                true,
                false,
                false,
                true
            ),
                previousDisplay = getComputedStyle(element, null).display;

            element.style.display = "inline-block";

            width = this.domUtils.getElementWidth(element);

            // If width is incorrectly calculated use parent width instead.
            if (parentWidth > 0 && (!width || width > parentWidth)) {
                width = parentWidth;
            }

            element.style.display = previousDisplay;
        }

        return width;
    }

    /**
     * Add class to adapt media to a certain element.
     *
     * @param {HTMLElement} element Element to add the class to.
     */
    protected addMediaAdaptClass(element: HTMLElement): void {
        element.classList.add("core-media-adapt-width");
    }

    /**
     * Wrap an image with a container to adapt its width and, if needed, add an anchor to view it in full size.
     *
     * @param {number} elWidth Width of the directive's element.
     * @param {HTMLElement} img Image to adapt.
     */
    protected adaptImage(elWidth: number, img: HTMLElement): void {
        console.log("img in adaptIMg");
        console.log(img);
        const imgWidth = this.getElementWidth(img),
            // Element to wrap the image.
            container = document.createElement("span");

        container.classList.add("core-adapted-img-container");
        container.style.cssFloat = img.style.cssFloat; // Copy the float to correctly position the search icon.
        if (img.classList.contains("atto_image_button_right")) {
            container.classList.add("atto_image_button_right");
        } else if (img.classList.contains("atto_image_button_left")) {
            container.classList.add("atto_image_button_left");
        }

        this.domUtils.wrapElement(img, container);

        if (imgWidth > elWidth) {
            // The image has been adapted, add an anchor to view it in full size.
            this.addMagnifyingGlass(container, img);
        }
    }

    /**
     * Add a magnifying glass icon to view an image at full size.
     *
     * @param {HTMLElement} container The container of the image.
     * @param {HTMLElement} img The image.
     */
    addMagnifyingGlass(container: HTMLElement, img: HTMLElement): void {
        const imgSrc = this.textUtils.escapeHTML(img.getAttribute("src")),
            label = this.textUtils.escapeHTML(
                this.translate.instant("core.openfullimage")
            ),
            anchor = document.createElement("a");

        anchor.classList.add("core-image-viewer-icon");
        anchor.setAttribute("aria-label", label);
        // Add an ion-icon item to apply the right styles, but the ion-icon component won't be executed.
        anchor.innerHTML =
            '<ion-icon name="search" class="icon icon-md ion-md-search"></ion-icon>';

        anchor.addEventListener("click", (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            this.domUtils.viewImage(
                imgSrc,
                img.getAttribute("alt"),
                this.component,
                this.componentId
            );
        });

        container.appendChild(anchor);
    }

    /**
     * Add media adapt class and apply CoreExternalContentDirective to the media element and its sources and tracks.
     *
     * @param {HTMLElement} element Video or audio to treat.
     */
    protected treatMedia(element: HTMLElement): void {
        this.addMediaAdaptClass(element);
        this.addExternalContent(element);

        const sources = Array.from(element.querySelectorAll("source")),
            tracks = Array.from(element.querySelectorAll("track"));

        sources.forEach(source => {
            source.setAttribute("target-src", source.getAttribute("src"));
            source.removeAttribute("src");
            this.addExternalContent(source);
        });

        tracks.forEach(track => {
            this.addExternalContent(track);
        });
    }

    /**
     * Treat video filters. Currently only treating youtube video using video JS.
     *
     * @param {HTMLElement} el Video element.
     */
    protected treatVideoFilters(video: HTMLElement): void {
        // Treat Video JS Youtube video links and translate them to iframes.
        if (!video.classList.contains("video-js")) {
            return;
        }

        const data = this.textUtils.parseJSON(
            video.getAttribute("data-setup") ||
            video.getAttribute("data-setup-lazy") ||
            "{}"
        ),
            youtubeId =
                data.techOrder &&
                data.techOrder[0] &&
                data.techOrder[0] == "youtube" &&
                data.sources &&
                data.sources[0] &&
                data.sources[0].src &&
                this.youtubeGetId(data.sources[0].src);

        if (!youtubeId) {
            return;
        }

        const iframe = document.createElement("iframe");
        iframe.id = video.id;
        iframe.src = "https://www.youtube.com/embed/" + youtubeId;
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("allowfullscreen", "1");
        iframe.width = "100%";
        iframe.height = "300";

        // Replace video tag by the iframe.
        video.parentNode.replaceChild(iframe, video);
    }

    /**
     * Convenience function to extract YouTube Id to translate to embedded video.
     * Based on http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
     *
     * @param {string} url URL of the video.
     */
    protected youtubeGetId(url: string): string {
        const regExp = /^.*(?:(?:youtu.be\/)|(?:v\/)|(?:\/u\/\w\/)|(?:embed\/)|(?:watch\?))\??v?=?([^#\&\?]*).*/,
            match = url.match(regExp);

        return match && match[1].length == 11 ? match[1] : "";
    }

    /**
     * Add media adapt class and treat the iframe source.
     *
     * @param {HTMLIFrameElement} iframe Iframe to treat.
     * @param {CoreSite} site Site instance.
     * @param  {Boolean} canTreatVimeo Whether Vimeo videos can be treated in the site.
     */
    protected treatIframe(
        iframe: HTMLIFrameElement,
        site: CoreSite,
        canTreatVimeo: boolean
    ): void {
        this.addMediaAdaptClass(iframe);

        if (iframe.src && canTreatVimeo) {
            // Check if it's a Vimeo video. If it is, use the wsplayer script instead to make restricted videos work.
            const matches = iframe.src.match(
                /https?:\/\/player\.vimeo\.com\/video\/([0-9]+)/
            );
            if (matches && matches[1]) {
                const newUrl =
                    this.textUtils.concatenatePaths(
                        site.getURL(),
                        "/media/player/vimeo/wsplayer.php?video="
                    ) +
                    matches[1] +
                    "&token=" +
                    site.getToken();

                // Width and height are mandatory, we need to calculate them.
                let width, height;

                if (iframe.width) {
                    width = iframe.width;
                } else {
                    width = this.getElementWidth(iframe);
                    if (!width) {
                        width = window.innerWidth;
                    }
                }

                if (iframe.height) {
                    height = iframe.height;
                } else {
                    height = this.getElementHeight(iframe);
                    if (!height) {
                        height = width;
                    }
                }

                // Always include the width and height in the URL.
                iframe.src = newUrl + "&width=" + width + "&height=" + height;
                if (!iframe.width) {
                    iframe.width = width;
                }
                if (!iframe.height) {
                    iframe.height = height;
                }

                // Do the iframe responsive.
                if (
                    iframe.parentElement.classList.contains("embed-responsive")
                ) {
                    iframe.addEventListener("load", () => {
                        const css = document.createElement("style");
                        css.setAttribute("type", "text/css");
                        css.innerHTML = "iframe {width: 100%;height: 100%;}";
                        iframe.contentDocument.head.appendChild(css);
                    });
                }
            }
        }
    }

    /**
     * Returns the element height in pixels.
     *
     * @param {HTMLElement} elementAng Element to get height from.
     * @return {number} The height of the element in pixels. When 0 is returned it means the element is not visible.
     */
    protected getElementHeight(element: HTMLElement): number {
        return this.domUtils.getElementHeight(element) || 0;
    }

    startTourNavigateToFloor() {
        this.navCtrl.push(NavigationFloorsPage, {
            modulesSplittedContentArray: this.modulesSplittedContentArray // Content of the navigation maps (image, description, hostspots)
        });
    }

    changeMap(index) {
        let roomModulesArray;
        this.mapIndexToShow = index;
        this.showRoomDescription = false;
        this.hotspotsLoaded = false;
        roomModulesArray = this.createMapsModulesArray("rooms");
        this.createTheSplittedContentInArray(roomModulesArray, 'rooms');


    }

    showRoomDetails(index) {
        this.roomIndexToShow = index;
        this.showRoomDescription = true;
    }

    showMap(mode) {
        if (mode === 'map') {
            this.showRoomDescription = false;
        } else if (mode === 'room') {
            this.showExponatDescription = false;
        }
    }

    async goToRoom(roomIndexToShow) {
        let roomTopicContent: any[] = [];
        roomTopicContent = (<any[]>await this.getTopicContentOfOneRoom());
        console.log('getTopicContentOne Room');
        console.log(roomTopicContent);
        this.navCtrl.push(NavigationFloorsPage, {
            roomTopicContent: roomTopicContent,
            roomContent: this.roomModulesSplittedContentArray[roomIndexToShow]
        });
    }

    goToList(index, mode) {
        this.visible = !this.visible;
        // this.navCtrl.push(NavigationFloorsPage, {
        //     roomTopicContent: roomTopicContent,
        //     roomContent: this.roomModulesSplittedContentArray[roomIndexToShow]
        // });
    }
}
