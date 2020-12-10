import { Component } from '@angular/core';
declare function triggerRecordButton(): any;
declare function getCommunicationScore(): any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'audio-to-text-communication-result';
  comresult= {"Result":"Wait...."};
  ngOnInit(){ 
    triggerRecordButton();     
  }
  getComScore(){
    this.comresult = getCommunicationScore();
  }
}
