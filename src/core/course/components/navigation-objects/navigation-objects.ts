// (C) Copyright 2018 David Pohl
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
import { NavigationMapProvider } from './../../../../providers/navigation-map-provider';

@Component({
	selector: 'page-navigation-objects',
	templateUrl: 'navigation-objects.html'
})
export class NavigationObjectsPage {

	roomTopicContent: any;
	roomContent: any;

	constructor(public navCtrl: NavController,
		navParams: NavParams,
		private navigationMapProvider: NavigationMapProvider) {
			this.roomTopicContent = navParams.get('roomTopicContent');
			this.roomContent = navParams.get('roomContent');
		}

	showRoomObjectPage(index: number): void {
		const currentPageIndex: number = this.navCtrl.getActive().index;
		this.navCtrl.remove(2, (currentPageIndex - 2));
		this.navigationMapProvider.emitnavigationSectionEvent(this.roomTopicContent[index].sectionId);
		this.navCtrl.pop();
	}
}
