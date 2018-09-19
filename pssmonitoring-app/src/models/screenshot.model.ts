import { ImageStatus } from "../enums/imageStatus.enum";

export class ScreenShot {
    Base64!: string;
    Status!: ImageStatus;
    ImageName!: string;
    CreationDateTime!: string;
}