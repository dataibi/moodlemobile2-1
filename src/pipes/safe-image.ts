import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
*/
@Pipe({name: 'safe_image'})
export class SafeImagePipe implements PipeTransform {

    constructor(
		private domSanitizer: DomSanitizer
	) {}

  transform(value: string) {
    
    return this.domSanitizer.bypassSecurityTrustResourceUrl(value);
  }
}