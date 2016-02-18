'use strict';

(function() {
    let template = `
        <style>
            .row {
                padding: 7px 10px;
            }
            .row:hover {
                background-color: #eaeaea;
            }
            
            .drag {
                // opacity: .7;
            }
            
            .over {
                border-top: 2px solid #aaa;
                padding: 5px 10px 7px 10px;
            }
            
            .icon {
                background-position: center;
                background-repeat: no-repeat;
                background-size: contain;
                height: 18px;
                width: 18px;
                float: left;
                margin-right: 10px;
                // background-color: #ccc;
            }
            
            .title {
                font-size: 16px;
                
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        </style>
        
        <div class="row" draggable="true">
            <div class="icon"></div>
            <div class="title">Site Title</div>
        </div>
    `;
    
    class CardRow extends HTMLElement {
        createdCallback() {
            this.createShadowRoot().innerHTML = template;
            this.$row = this.shadowRoot.querySelector('.row');
            this.$icon = this.shadowRoot.querySelector('.icon');
            this.$title = this.shadowRoot.querySelector('.title');
            
            let self = this;
            
            this.$row.addEventListener('dragstart', function(ev) {
                ev.dataTransfer.effectAllowed = 'move';
                ev.dataTransfer.setData('divid', self.id);
                this.classList.add('drag');

                return false;
            });
            
            this.$row.addEventListener('dragend', function(ev) {
                this.classList.remove('drag');

                return false;
            });
            
            this.$row.addEventListener('dragover', function(ev) {
                ev.dataTransfer.dropEffect = 'move';

                if (ev.preventDefault) {
                    ev.preventDefault();
                }

                this.classList.add('over');
                
                return false;
            });

            this.$row.addEventListener('dragleave', function(ev) {
                this.classList.remove('over');
            });
            
            this.$row.addEventListener('drop', function(ev) {
                if (ev.stopPropagation) {
                    ev.stopPropagation();
                }

                this.classList.remove('over');

                let fromRow = this.ownerDocument.getElementById(ev.dataTransfer.getData('divid'));
                let toRow = this.parentNode.host;
                let card = this.parentNode.host.parentNode;
                
                let index;
                for (let i=0; i<card.children.length; i++) {
                    if (toRow.id == card.children[i].id) {
                        index = i;
                    }
                }

                card.insertBefore(fromRow, toRow);
                
                ChromeService.moveBookmark(fromRow.data.id, card.data.id, index);
            });
            
            this.addEventListener('click', function() {
                ChromeService.updateTab(this.data.url);
            })
        }
        
        attributeChanged(attrName, oldVal, newVal) {
            console.log(attrName + " changed");
            switch (attrName) {
                case 'data':
                    this.updateInfo();
                    break;
            }
        }
        
        get site() {
            let s = this.getAttribute('site');
            s = JSON.parse(s);
            return s;
        }
        
        set site(val) {
            this.setAttribute('site', JSON.stringify(val));
        }
        
        get title() {
            let title = this.attribute('title');
            return title;
        }
        
        set title(val) {
            this.setAttribute('title', val);
        }
        
        get data() {
            return JSON.parse(this.getAttribute('data'));
        }
        
        set data(val) {
            this.setAttribute('data', JSON.stringify(val));
            
            this.updateInfo();
        }
        
        updateInfo() {
            this.$icon.style.backgroundImage = 'url("https://plus.google.com/_/favicon?domain=' + this.data.url + '")';
            this.$title.textContent = this.data.title;
        }
    }
    
    document.registerElement('card-row', CardRow);
})();