export class DataProvider {
    static getDataFromWeb(url) {
        fetch(url).then((res) => {
            if (res.ok) {
                return res.text;
            }
            else {
                return null;
            }
        });
    }
    static getJsonObject(url) {
        let json = this.getDataFromWeb(url);
        if (json) {
            return JSON.parse(json);
        }
        throw new Error("Json error.");
    }
}
//# sourceMappingURL=DataProvider.js.map