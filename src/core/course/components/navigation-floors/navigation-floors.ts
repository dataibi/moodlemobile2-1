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
import { NavController, NavParams } from 'ionic-angular';
import { NavigationObjectsPage } from './../navigation-objects/navigation-objects';
import { QrScannerPage } from './../../../../components/qr-scanner/qr-scanner-page';

@Component({
	selector: 'page-navigation-floors',
	templateUrl: 'navigation-floors.html'
})
export class NavigationFloorsPage {

	roomTopicContent: any[];
	roomContent: any;
	course: any;

	constructor(public navCtrl: NavController, navParams: NavParams) {
			this.roomTopicContent = navParams.get('roomTopicContent');
			this.roomContent = navParams.get('roomContent');
			this.course = navParams.get('course');

		}

	showRoomObjects(): void {
		this.navCtrl.push(NavigationObjectsPage,
			{
				roomTopicContent: this.roomTopicContent,
				roomContent: this.roomContent,
				course: this.course
			});
	}

	navToProfile(ev?: Event): void {
		ev && ev.preventDefault();
		ev && ev.stopPropagation();

		this.navCtrl.push('CoreMainMenuMorePage');
	}

	backToMapView(ev?: Event): void {
		ev && ev.preventDefault();
		ev && ev.stopPropagation();

		this.navCtrl.popToRoot();
	}

	navToQrScanner(): void {
        this.navCtrl.push(QrScannerPage, {course: this.course, isLogin: false});
    }
}
