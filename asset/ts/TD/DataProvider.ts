export class DataProvider {
    public static async getJson(url: string) {
        let response = await fetch(url);
        if (response.ok) {
            let json = await response.json();
            return json;
        } else {
            throw new Error("Fail to fetch json data.");
        }
    }

    public static async getImage(url:string) {
        let response = await fetch(url, {mode: 'no-cors'});
        if (response.ok) {
            let image = await response.blob();
            return URL.createObjectURL(image);
        }
    }
}