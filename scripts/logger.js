class Logger {
    constructor (fontSize, padding, x, y, width, height) {
        this.lines = [];
        this.fontSize = fontSize ? fontSize : 12;
        this.padding = padding ? padding : 20;
        this.x = x ? x : 0;
        this.y = y ? y : 0;
        this.width = width ? width : windowWidth;
        this.height = height ? height : windowHeight;
        this.toShow = Math.floor( (windowHeight - this.padding * 2) / (this.fontSize * 1.5) );
    }

    get text () {
        let text = '';
        let start = Math.max(this.lines.length - this.toShow, 0);
        for (var i = start; i < this.lines.length; i++) {
            let line = this.lines[i];
            text += '[' + line.time + '] ' + line.text + '\n'
        }
        return text;
    }

    log () {
        let text = '';
        for (var arg of arguments) {
            text += arg + ' ';
        }
        this.lines.push({
            time: moment().format('YYYY-MM-DD hh:mm:ss'),
            text: text,
            type: 'normal'
        })
    }

    draw() {
        fill(255);
        text(this.text, this.padding, this.padding);
    }
}