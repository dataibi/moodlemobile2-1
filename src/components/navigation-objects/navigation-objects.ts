import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { NavigationMapProvider } from '@providers/navigation-map-provider';
import { CoreCourseFormatComponent } from '@core/course/components/format/format';
import { ViewController } from 'ionic-angular/navigation/view-controller';
// import { HomeDetailPage } from '../homeDetail/home-detail';
// import { Museum } from '../../models/museum.model';
// import { FloorPage } from '../floor/floor';

@Component({
	selector: 'page-navigation-objects',
	templateUrl: 'navigation-objects.html'
})
export class NavigationObjectsPage {

	roomTopicContent: any;
	roomContent: any;

	

	constructor(public navCtrl: NavController,
		private navParams: NavParams,
		private navigationMapProvider: NavigationMapProvider,
		private viewCtrl: ViewController) {
			this.roomTopicContent = navParams.get("roomTopicContent");
			console.log('roomTopicContent in objects');
			console.log(this.roomTopicContent);
			this.roomContent = navParams.get("roomContent");

			console.log('contentn in objects');
			console.log(this.roomContent);
		}
	
	showRoomObjectPage(index) {
		let currentPageIndex: number = this.navCtrl.getActive().index;
		this.navCtrl.remove(2,(currentPageIndex - 2));
		this.navigationMapProvider.emitnavigationSectionEvent(this.roomTopicContent[index].sectionId);
		this.navCtrl.pop();
	}




}
