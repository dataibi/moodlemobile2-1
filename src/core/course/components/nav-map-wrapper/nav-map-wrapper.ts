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
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
	selector: 'nav-map-wrapper',
	templateUrl: 'nav-map-wrapper.html'
})
export class NavigationMapWrapperPage {
	module;
	course;
	data;

	constructor(public navCtrl: NavController, navParams: NavParams) {
		this.module = navParams.get('module');
		this.course = navParams.get('course');
		this.data = navParams.get('data');
	}

	navToProfile(): void {
		this.navCtrl.push('CoreMainMenuMorePage');
	}
}
