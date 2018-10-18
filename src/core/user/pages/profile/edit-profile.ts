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

import { Component } from '@angular/core';
import { IonicPage, NavParams, Platform, NavController } from 'ionic-angular';
import { CoreUserProvider } from '../../providers/user';
import { CoreUserHelperProvider } from '../../providers/helper';
import { CoreDomUtilsProvider } from '@providers/utils/dom';
import { CoreEventsProvider } from '@providers/events';
import { CoreSitesProvider } from '@providers/sites';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/**
 * Page that displays an user about page.
 */
@IonicPage({ segment: 'core-edit-profile' })
@Component({
    selector: 'page-core-edit-profile',
    templateUrl: 'edit-profile.html',
})
export class CoreEditProfilePage {
    protected courseId: number;
    protected userId: number;
    protected siteId;

    userLoaded = false;
    hasContact = false;
    hasDetails = false;
    isAndroid = false;
    user: any = {};
    title: string;

    profileForm: FormGroup;

    constructor(navParams: NavParams, private userProvider: CoreUserProvider, private userHelper: CoreUserHelperProvider,
            private domUtils: CoreDomUtilsProvider, private eventsProvider: CoreEventsProvider, private navCtrl: NavController,
            private sitesProvider: CoreSitesProvider, private fb: FormBuilder, private platform: Platform) {

        this.userId = navParams.get('userId');
        this.courseId = navParams.get('courseId');
        this.isAndroid = this.platform.is('android');

        this.siteId = this.sitesProvider.getCurrentSite().getId();
        this.profileForm = fb.group({
            email: [navParams.get('email') || '', Validators.required],
            fullname: [navParams.get('fullname') || '', Validators.required],
            firstname: [navParams.get('firstname') || '', Validators.required],
            lastname: [navParams.get('lastname') || '', Validators.required]
        });
    }

    /**
     * View loaded.
     */
    ionViewDidLoad(): void {
        this.fetchUser().finally(() => {
            this.userLoaded = true;
        });
    }

    /**
     * Fetches the user and updates the view.
     */
    fetchUser(): Promise<any> {
        return this.userProvider.getProfile(this.userId, this.courseId).then((user) => {

            if (user.address) {
                user.address = this.userHelper.formatAddress(user.address, user.city, user.country);
                user.encodedAddress = encodeURIComponent(user.address);
            }

            this.hasContact = user.email || user.phone1 || user.phone2 || user.city || user.country || user.address;
            this.hasDetails = user.url || user.interests || (user.customfields && user.customfields.length > 0);

            this.user = user;
            this.title = user.fullname;
        }).catch((error) => {
            this.domUtils.showErrorModalDefault(error, 'core.user.errorloaduser', true);
        });
    }

    /**
     * Refresh the user.
     *
     * @param {any} refresher Refresher.
     */
    refreshUser(refresher?: any): void {
        this.userProvider.invalidateUserCache(this.userId).finally(() => {
            this.fetchUser().finally(() => {
                const currentSite = this.sitesProvider.getCurrentSite(),
                siteInfo = currentSite.getInfo();
                currentSite.setInfo({...siteInfo, fullname: this.title});
                this.eventsProvider.trigger(CoreUserProvider.PROFILE_REFRESHED, {
                    courseId: this.courseId, userId: this.userId,
                    user: this.user
                }, this.siteId);
                refresher && refresher.complete();
            });
        });
    }

    saveProfile(): Promise<any> {
        const firstname = this.profileForm.value.firstname,
        lastname = this.profileForm.value.lastname,
        email = this.profileForm.value.email;

        return this.userProvider.changeUserProfile(this.userId, firstname, lastname, email).then(() => {
            this.refreshUser();
            this.navCtrl.pop();
            }).catch((message) => {
            if (message) {
                this.domUtils.showErrorModal(message);
            }
        });
    }

}
