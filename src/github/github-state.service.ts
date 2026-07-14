import { Injectable } from '@nestjs/common';


@Injectable()
export class GithubStateService {


  generateState(userId:string){

    const payload = {
      userId,
    };


    return Buffer
      .from(JSON.stringify(payload))
      .toString('base64');

  }



  decodeState(state:string){

    const decoded = Buffer
      .from(state,'base64')
      .toString();


    return JSON.parse(decoded);

  }

}