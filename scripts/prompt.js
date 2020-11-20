class Overlay {
    constructor () {
        this.parent = select('#overlay-container');
        this.element = createDiv();
        this.element.addClass('overlay');
    }

    appear () {
        this.element.parent(this.parent);
        this.element.addClass('appear');
        setTimeout(function () {
            this.element.removeClass('appear');
        }.bind(this), 50);
    }

    disappear () {
        this.element.addClass('disappear');
        setTimeout(function () {
            this.element.removeClass('disappear');
            this.element.remove();
        }.bind(this), 500);
    }
}

class Prompt {
    constructor (texts, callback) {
        this.parent = select('#prompts');
        this.element = createDiv();
        this.element.addClass('prompt')
        this.texts = texts ? texts : '';
        this.updateText();

        if (callback) {
            this.element.mousePressed(callback);
        }
    }

    updateText() {
        if (typeof this.texts === 'string') {
            this.element.html(this.texts);
        } else {
            this.element.html('');
            for (let text of this.texts) {
                let div = createDiv();
                div.html(text);
                this.element.child(div);
            }
        }
    }

    attach () {
        this.element.parent(this.parent);
        this.element.addClass('appear');
        setTimeout(function () {
            this.element.removeClass('appear');
        }.bind(this), 50);
    }

    detach () {
        this.element.addClass('disappear');
        setTimeout(function () {
            this.element.remove();
        }.bind(this), 500);
    }
}

class OverlayPrompt {
    constructor (texts, buttons) {
        this.parent = select('#overlay-prompts');
        this.element = createDiv();
        this.element.addClass('overlay-prompt')
        this.buttonsElement = createDiv();
        this.buttonsElement.addClass('overlay-prompt-buttons');

        this.texts = texts ? texts : '';
        this.buttons = buttons ? buttons : {};
        this.updateText();
        this.createButtons();
    }

    updateText() {
        if (typeof this.texts === 'string') {
            this.element.html(this.texts);
        } else {
            this.element.html('');
            for (let text of this.texts) {
                let div = createDiv();
                div.html(text);
                this.element.child(div);
            }
        }
    }

    createButtons () {
        for (let btn of Object.keys(this.buttons)) {
            // console.log(btn);
            let button = createButton(btn);
            button.mousePressed(this.buttons[btn]);
            this.buttonsElement.child(button);
        }
        this.element.child(this.buttonsElement);
    }

    attach () {
        this.element.parent(this.parent);
        this.element.addClass('appear');
        setTimeout(function () {
            this.element.removeClass('appear');
        }.bind(this), 50);
    }

    detach () {
        this.element.addClass('disappear');
        setTimeout(function () {
            this.element.remove();
        }.bind(this), 500);
    }
}

class PromptManager {
    constructor (max) {
        this.blockingPrompts = [];
        this.nonblockingPrompts = [];
        this.max = max ? max : 1;
        this.showing = false;

        this.topPrompts = createDiv();
        this.topPrompts.addClass('prompts');
        this.topPrompts.id('prompts');
        select('body').child(this.topPrompts);

        let container = createDiv();
        container.addClass('overlay-container');
        container.id('overlay-container');
        select('body').child(container);

        this.overlay = new Overlay();

        this.overlayPrompts = createDiv();
        this.overlayPrompts.addClass('overlay-prompts');
        this.overlayPrompts.id('overlay-prompts');
        select('body').child(this.overlayPrompts);
    }

    show (promptText, buttons) {
        let prompt = new OverlayPrompt(promptText, buttons);
        this.blockingPrompts.push(prompt);
        prompt.attach();
        this.overlay.appear();

        if (this.blockingPrompts.length > this.max) {
            let toRemove = this.blockingPrompts.slice(0, this.blockingPrompts.length - this.max);
            for (let prompt of toRemove) {
                prompt.detach();
            }
            this.blockingPrompts.splice(0, this.blockingPrompts.length - this.max);
        }
    }

    showNonblocking (promptText, callback) {
        let prompt = new Prompt(promptText, callback);
        this.nonblockingPrompts.push(prompt);
        prompt.attach();

        if (this.nonblockingPrompts.length > this.max) {
            let toRemove = this.nonblockingPrompts.slice(0, this.nonblockingPrompts.length - this.max);
            for (let prompt of toRemove) {
                prompt.detach();
            }
            this.nonblockingPrompts.splice(0, this.nonblockingPrompts.length - this.max);
        }
    }

    clear () {
        for (let prompt of this.blockingPrompts) {
            prompt.detach();
        }
        this.overlay.disappear();
    }

    clearNonblocking () {
        for (let prompt of this.nonblockingPrompts) {
            prompt.detach();
        }
    }
}