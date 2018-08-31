import { Component } from '@angular/core';
import { NavParams, ViewController, NavController } from 'ionic-angular';

@Component({
	selector: 'page-navigation-modal',
	templateUrl: 'navigation-modal.html'
})
export class NavigationModalPage {


	constructor(params: NavParams, public viewCtrl: ViewController, public navCtrl: NavController) {
		console.log('UserId', params.get('userId'));
	  }

	closeModal() {
		this.navCtrl.pop();
    	// .then(() => this.navCtrl.remove(1,1));
	}





}
