import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { NavigationMapProvider } from '@providers/navigation-map-provider';
// import { HomeDetailPage } from '../homeDetail/home-detail';
// import { Museum } from '../../models/museum.model';
// import { FloorPage } from '../floor/floor';

@Component({
	selector: 'page-navigation-floors',
	templateUrl: 'navigation-floors.html'
})
export class NavigationFloorsPage implements OnInit {

	roomTopicContent: any[];
	roomContent: any[];

	

	constructor(public navCtrl: NavController, private navParams: NavParams, private navigationMapProvider: NavigationMapProvider) {
			this.roomTopicContent = navParams.get("roomTopicContent");
			this.roomContent = navParams.get("roomContent");
		}
	

	// openMuseumDetail(room_index) { //TODO: dont use [0]
	// 	this.navCtrl.push(HomeDetailPage, { room: this.museum_data.floors[this.segment_index].floor_spots[room_index].room });
	// }

	// showRoomDetails(floor_index: number, room_index: number): void {
	// 	this.room_index = room_index;
	// 	this.floorDetailAreSshown = true;
	// }

	// showMuseumDetails() {
	// 	this.floorDetailAreSshown = false;
	// }

	ngOnInit() {
	}

	ionViewWillEnter() {
		// this.mapData = this.navigationMapProvider.getCourseData().sections[1].modules;
		// let i = 0;
		// for (i; this.maps.length; i++) {
		// 	this.parseDataFromPageContent(i, this.maps[i]);
		// }
		

		
	}

	ionViewDidEnter() {
	}

	MapToShow(index) {
		// this.navCtrl.push(FloorPage , { floor: this.museum_data.floors[index] });
	}

	// doRefresh(refresher: Refresher) {
	// 	// this.museumDataProvider.fetchMuseumData();
    //     const subscription = this.museumDataProvider.fetchMuseumData().subscribe(museum_data => {
	// 		refresher.complete()
	// 		this.museum_data = <Museum>museum_data;
	// 		subscription.unsubscribe();
	// 	}, () => refresher.complete());
	// }
	
	showMapDetails() {
	}

	showRoomDetails(showRoomIndex) {

	}

	// private parseDataFromPageContent(i, content: any) {
	// 	let imageTag: string, childList: string, description: string;
    //     // Retrieve the navigation map data from the HTML content
    //     console.log('content');
    //     console.log(content);
    //     imageTag = content.substring(content.indexOf('<img'));
    //     console.log('imageTag');
    //     console.log(imageTag);
    //     imageTag = imageTag.substring(0, imageTag.indexOf('>') + 1);
    //     console.log('imageTag');
    //     console.log(imageTag);
    //     this.contentsplittedMaps[i].image = imageTag;

    //     childList = content.substring(content.indexOf('<ol>') + 4);
    //     console.log('childList');
    //     console.log(childList);
    //     childList = childList.substring(0, childList.indexOf('</ol>'));
    //     console.log('childList');
	// 	console.log(childList);
	// 	this.contentsplittedMaps[i].childrenList = childList;

    //     description = content.substring(content.indexOf('</ol>') + 5);
    //     this.contentsplittedMaps[i].descriptionInParagraphsArray = description.split('/<p>|</p>/');
    //     console.log('description');
    //     console.log(description);
    //     this.contentsplittedMaps[i].description = description;

    //     const tokens = childList.split('</li>');
    //     console.log('tokens');
    //     console.log(tokens);
    //     for (let token of tokens) {
    //         if (token.includes('/mod/page/')) {
    //             token = token.substring(token.indexOf('php?id='));
    //             console.log('token');
    //             console.log(token);
    //             token = token.substring(token.indexOf('=') + 1, token.indexOf('>') - 1);
    //             console.log('token');
    //             console.log(token);
    //             this.contentsplittedMaps[i].childPages.push(token);
    //         } else if (token.includes('/course/view.php')) {
    //             token = token.substring(token.indexOf('php?id='));
    //             console.log('token');
    //             console.log(token);
    //             token = token.substring(token.indexOf('#') + 1, token.indexOf('>') - 1);
    //             console.log('token');
    //             console.log(token);
    //             this.contentsplittedMaps[i].childSections.push(token);
    //         }
    //     }

    // }

	// openRoomDetail(roomIndex, FloorIndex) {
	// 	this.navCtrl.push(HomeDetailPage, { room: this.floor.floorSpots[room_index].room });
	// }



}
