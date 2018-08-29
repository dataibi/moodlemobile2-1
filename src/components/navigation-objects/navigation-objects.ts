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
	title: string;

	

	constructor(public navCtrl: NavController,
		private navParams: NavParams,
		private navigationMapProvider: NavigationMapProvider,
		private viewCtrl: ViewController) {
			this.roomTopicContent = navParams.get("roomTopicContent");
			this.title = navParams.get("title");
			console.log('this.title');
			console.log(this.title);
		}
	
	showRoomObjectPage(index) {
		console.log('this.roomTopicContent');
		console.log(this.roomTopicContent);
		console.log('this.navCtrl.getViews()');
		console.log(this.navCtrl.length());
		this.navCtrl.remove(2, 1);
		console.log('this.navCtrl.getViews() after');
		console.log(this.navCtrl.length());
		console.log('this.roomTopicContent[index].sectionId');
		console.log(this.roomTopicContent[index].sectionId);
		this.navigationMapProvider.emitnavigationSectionEvent(this.roomTopicContent[index].sectionId);
		this.navCtrl.pop();
	}




}
