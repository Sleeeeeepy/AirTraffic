export class DataProvider {
    private static getDataFromWeb(url: string): string | any {
        fetch(url).then((res) => {
            if (res.ok) {
                return res.text;
            } else {
                return null;
            }
        })
    }

    public static getJsonObject(url: string): any {
        let json = this.getDataFromWeb(url);
        if (json) {
            return JSON.parse(json);
        }
        throw new Error("Json error.");
    }
}