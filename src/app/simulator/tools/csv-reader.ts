
export enum CsvFormat {
    ENTSOE,
    BS
}

export class CsvReader {

    onFileParsedCallback : ({}) => void;

    constructor(callback : ({}) => void)
    {
        this.onFileParsedCallback = callback;
    }

    ReadFromUrl(url: URL, format: CsvFormat) {
    }

    ReadFromFile(input: HTMLInputElement, format: CsvFormat) : boolean {

        const files = input.files;
        if (!files || files.length == 0) {
            console.error("CsvReader.ReadFromFile: invalid file");
            return false;
        }
        console.log("Filename: " + files[0].name);
        console.log("Type: " + files[0].type);
        console.log("Size: " + files[0].size + " bytes");

        const fileToRead = files[0];

        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            this.OnFileLoad(e, format);
        }

        fileReader.readAsText(fileToRead, "UTF-8");

        return true;
    }

    OnFileParsed(result : {}) : void {
        this.onFileParsedCallback(result)
    }


    OnFileLoad(fileLoadedEvent, format: CsvFormat) : void {

        switch(format)
        {
            case CsvFormat.ENTSOE:
                this.ParseENTSOEFile(fileLoadedEvent.target.result);
            break;
        }

    }

    ParseENTSOEFile(text) : void {
        const lines = text.split('\n');

        var result = {};

        if(lines.length  == 0)
        {
            console.error("CsvReader.ParseENTSOEFile: file have 0 lines");
            return;
        }

        var header = this.SplitLineENTSOE(lines[0])

        result['header'] = header;
        result['data'] = [];

        var data = result['data'];

        var minColumnCount = header.length;
        var maxColumnCount = header.length;

        for(var i = 1; i < lines.length ; i++)
        {
            var line = lines[i]
            if(line.length == 0)
            {
                continue;
            }
            var lineParts = this.SplitLineENTSOE(line);

            if(lineParts.length != header.length)
            {
                console.error("Bad line "+i+": "+lineParts.length+" parts but "+header.length+" expected");
                minColumnCount = Math.min(minColumnCount, lineParts.length);
                maxColumnCount = Math.max(maxColumnCount, lineParts.length);
            }


            data.push(lineParts);
        }

        if(minColumnCount != maxColumnCount)
        {
            console.error("Invalid csv: header="+ header.length+" min="+minColumnCount+" max="+maxColumnCount);
        }

        this.OnFileParsed(result);
    }

    SplitLineENTSOE(line) : string[] {
        const lineParts = line.split(',');

        var parts = [];
        lineParts.forEach(part => {
            parts.push(part.substring(1, part.length - 1));
          });
        return parts;
    }


/*
        const csvSeparator = '","';
        const textFromFileLoaded = fileLoadedEvent.target.result;
        this.csvContent = textFromFileLoaded;

        const txt = textFromFileLoaded;
        const csv = [];
        const lines = txt.split('\n');
        lines.forEach(element => {
          const cols: string[] = element.split(csvSeparator);
          csv.push(cols);
        });
        this.parsedCsv = csv;
        console.log(this.parsedCsv[0]);
        console.log("Line count: " + this.parsedCsv.length);

        // TODO custom parseur


    }*/
}
