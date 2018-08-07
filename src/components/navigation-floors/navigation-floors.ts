import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
// import { HomeDetailPage } from '../homeDetail/home-detail';
// import { Museum } from '../../models/museum.model';
// import { FloorPage } from '../floor/floor';

@Component({
	selector: 'page-navigation-floors',
	templateUrl: 'navigation-floors.html'
})
export class NavigationFloorsPage implements OnInit {

	// museum_data: Museum;
	isLoading: boolean;
	// floor_to_show: string;
	// floor_detail_are_shown: boolean = false;
	// room_index: number;
	// segment_index: number;
	// spots: Spot[] = [
	//   new Spot(1, 10, 10),
	//   new Spot(2, 30, 30),
	//   new Spot(3, 50, 50),
	//   new Spot(4, 70, 70)
	// ];

	constructor(public navCtrl: NavController) {
	}

	// openMuseumDetail(room_index) { //TODO: dont use [0]
	// 	this.navCtrl.push(HomeDetailPage, { room: this.museum_data.floors[this.segment_index].floor_spots[room_index].room });
	// }

	// showRoomDetails(floor_index: number, room_index: number): void {
	// 	this.room_index = room_index;
	// 	this.floor_detail_are_shown = true;
	// }

	// showMuseumDetails() {
	// 	this.floor_detail_are_shown = false;
	// }

	ngOnInit() {
		this.isLoading = true;
		// this.museum_data = this.museumDataProvider.getMuseumData();
		// this.museumDataProvider.fetchMuseumData();
		// const subscription = this.museumDataProvider.fetchMuseumData().subscribe(museum_data => {
		// 	this.isLoading = false;
		// 	this.museum_data = <Museum>museum_data;
		// 	subscription.unsubscribe();
		// }, () => this.isLoading = false);
		
	}

	showFloorPage(index) {
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



}
