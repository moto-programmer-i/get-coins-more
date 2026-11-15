import { Platform } from "../platform.js";

// 参考
// https://developers.poki.com/guide/sdk-html5

export class Poki extends Platform {
    async init() {
        await PokiSDK.init().then().catch((error) => {
            console.log("Poki init error");
            console.log(error);
            // Pokiの初期化に問題が起きたとき、何をするのか不明
        });
    }

    loadingFinished() {
        PokiSDK.gameLoadingFinished();
    }

    startOfStage() {
        PokiSDK.gameplayStart();
    }

    endOfStage() {
        // PokiのStopはステージ終了時らしい
        // https://developers.poki.com/guide/sdk-html5#3-implement-the-gameplay-events
        PokiSDK.gameplayStop();
    }

    async reward() {
        // 広告視聴中はゲームプレイ中ではない（多分）
        PokiSDK.gameplayStop();
        return await PokiSDK.rewardedBreak().then((success) => {
            PokiSDK.gameplayStart();
            console.log(success);
            return success;
        });
    }
    

}