import { NavController } from 'ionic-angular';
import { Component, NgZone } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';

@Component({
	selector: 'qr-scanner-page',
	templateUrl: 'qr-scanner-page.html'
})
export class QrScannerPage {

	scanned: string = '';

	constructor(
		public navCtrl: NavController,
		private qrScanner: QRScanner,
		private zone: NgZone
	) {

	}

	isScanned() {
		return this.scanned !== '';
	}


	showCamera() {
		(window.document.querySelector('ion-app') as HTMLElement).classList.add('cameraView');
	}
	hideCamera() {
		(window.document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');
	}

	openQr() {
		// Optionally request the permission early
		this.qrScanner.prepare()
			.then((status: QRScannerStatus) => {
				if (status.authorized) {
					// camera permission was granted
					//alert('authorized');

					// start scanning
					let scanSub = this.qrScanner.scan().subscribe((text: string) => {
						this.zone.run(
							() => this.scanned = text
						);

								// alert(text);
								this.qrScanner.hide(); // hide camera preview
								scanSub.unsubscribe(); // stop scanning
								this.hideCamera();

							});

						this.qrScanner.resumePreview();
						this.showCamera();
						// show camera preview
						this.qrScanner.show()
							.then((data: QRScannerStatus) => {
								console.log('datashowing', data);
								//alert(data.showing);
								// this.hideCamera();
							}, err => {
								//alert(err);

							});

						// wait for user to scan something, then the observable callback will be called

					} else if (status.denied) {
						alert('denied');
						// camera permission was permanently denied
						// you must use QRScanner.openSettings() method to guide the user to the settings page
						// then they can grant the permission from there
					} else {
						// permission was denied, but not permanently. You can ask for permission again at a later time.
						alert('else');
					}
				})
			.catch((e: any) => {
				alert('Error is' + e);
			});
	}
}
