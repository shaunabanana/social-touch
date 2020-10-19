class Prompt {
    constructor (texts) {
        this.parent = select('#prompts');
        this.element = createDiv();
        this.element.addClass('prompt')
        this.texts = texts ? texts : '';
        this.updateText();
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

class PromptManager {
    constructor (max) {
        this.prompts = [];
        this.max = max ? max : 1;
        this.container = createDiv();
        this.container.addClass('prompts');
        this.container.id('prompts');
        select('body').child(this.container);
    }

    show (promptText) {
        let prompt = new Prompt(promptText);
        this.prompts.push(prompt);
        prompt.attach();

        if (this.prompts.length > this.max) {
            let toRemove = this.prompts.slice(0, this.prompts.length - this.max);
            for (let prompt of toRemove) {
                prompt.detach();
            }
            this.prompts.splice(0, this.prompts.length - this.max);
        }
    }
}