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
}