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

	maps: object[];
	mapData: any;
	showMapIndex: number;
	showRoomIndex: number;
	mapDetailsAreShown: boolean;

	

	constructor(public navCtrl: NavController, private navParams: NavParams, private navigationMapProvider: NavigationMapProvider) {
			this.maps = navParams.get("mapsArray");
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
		this.mapDetailsAreShown = true;
		this.showMapIndex = 0;
	}

	ionViewWillEnter() {
		this.mapData = this.navigationMapProvider.getCourseData().sections[1].modules;
		
	}

	ionViewDidEnter() {
		console.log('willenter course data');
		console.log(this.mapData);
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
		this.mapDetailsAreShown = true;
	}

	showRoomDetails(showRoomIndex) {
		this.showRoomIndex = showRoomIndex;
		this.mapDetailsAreShown = false;

	}

	// openRoomDetail(roomIndex, FloorIndex) {
	// 	this.navCtrl.push(HomeDetailPage, { room: this.floor.floorSpots[room_index].room });
	// }



}
