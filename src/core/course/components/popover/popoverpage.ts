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

import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular/navigation/view-controller';
import { NavController } from 'ionic-angular/navigation/nav-controller';
import { AddonNotificationsListPage } from '@addon/notifications/pages/list/list';
import { NavParams } from 'ionic-angular/navigation/nav-params';

@Component({
    selector: 'own-popover-page',
    templateUrl: 'popoverpage.html'
})
export class OwnPopoverPage {

    homePage: any;
    constructor(
        public viewCtrl: ViewController,
        public navCtrl: NavController, public params: NavParams) {

        this.homePage = this.params.get('homeRef');
    }

    close(): Promise<any> {
        return this.viewCtrl.dismiss();
    }

    navToProfile(): void {
        this.homePage.navToProfile();
        this.viewCtrl.dismiss();
    }

    navToNotifications(): void {
        this.homePage.navToNotifications();
        this.viewCtrl.dismiss();
    }
}
