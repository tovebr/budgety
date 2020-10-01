var budgetController = (function(){

    var Expense = function (id, description, value){
        this.id = id;
        this.description= description,
        this.value= value,
        this.percent = -1
    };
    
    Expense.prototype.calcPercent = function() {
        if(data.totals.inc > 0) {
            this.percent = Math.round((this.value / data.totals.inc)* 100);
        } else {
            this.percent = -1;
        }
    };
    
    var Income = function (id, description, value){
        this.id = id;
        this.description= description,
        this.value= value
    };
    
    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percent: -1
    };
    
    var calculateTotals = function(type){
        var sum = 0;
        
        data.allItems[type].forEach(function(curr) {
            sum += curr.value;
        });
        
        data.totals[type] = sum;
    };
    
    var calculatePercentage = function(){
        if (data.totals.inc > 0 && data.totals.exp > 0){
            data.percent = Math.round((data.totals.exp / data.totals.inc) * 100);
        } else {
            data.percent = -1;
        }
    };
    
    return {
        addNewItem: function(newInput) {
            var id, newItem;
            
            if(data.allItems[newInput.type].length > 0) {
            id = data.allItems[newInput.type][data.allItems[newInput.type].length - 1].id + 1;
            } else {
                id = 0;
            }
            
            if (newInput.type === 'inc') {
                newItem = new Income(id, newInput.description, newInput.value);
            } else {
                newItem = new Expense(id, newInput.description, newInput.value);
                newItem.calcPercent();
            }
            
            data.allItems[newInput.type].push(newItem);
            
            return newItem;
        },
        
        calculateBudget: function(){
            calculateTotals('inc');
            calculateTotals('exp');
            
            data.budget = data.totals.inc - data.totals.exp;
            calculatePercentage();
        },
        
        getBudget: function(){
            return data;
        },
        
        deleteItem: function(type, id) {
            
            var ids = data.allItems[type].map(function(curr) {
                return curr.id;
            });
            
            var index = ids.indexOf(id);
            
            data.allItems[type].splice(index, 1);
            
        },
        
        test: function() {
            console.log(data);
        }
    }
    
})();

var UIController = (function(){
    
    var DOMstrings = {
        inputBtn: '.add__btn',
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        incomeList: '.income__list',
        expenseList: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        itemPercentageLabel: '.item__percentage',
        listItemContainer: '.container',
        monthLabel: '.budget__title--month'
    }
    
    var formatNumber = function(num, type){
        
            num = Math.abs(num);
            var newNum = num.toFixed(2);
        
            
            var numSplit = newNum.split('.');
            var int = numSplit[0];
            var dec = numSplit[1];
        
            
            if(int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }

        
            return (type === 'inc' ? '+ ' : '- ') + int + '.' +  dec;
            
            
    };
    
    return {
        
        getDomstrings: function(){
            
            return DOMstrings;
            
        },
        
        getInput: function() {
            
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        }, 
        
        clearFields: function(){
            
            var fields = [DOMstrings.inputDescription, DOMstrings.inputValue];
            
            
            fields.forEach(function(curr) {
               document.querySelector(curr).value = ''; 
            });
        },
        
        displayNewItem: function(newItem, type) {
            var html, newHtml, element;
            
            if (type === 'inc') {
                
                element = DOMstrings.incomeList;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else {
                
                element = DOMstrings.expenseList;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percent%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            newHtml = html.replace('%id%', newItem.id);
            newHtml = newHtml.replace('%description%', newItem.description);
            newHtml = newHtml.replace('%value%', formatNumber(newItem.value, type));
            
            if (type === 'exp'){
                if (newItem.percent == -1) {
                    newHtml = newHtml.replace('%percent%', '---');
                } else {
                newHtml = newHtml.replace('%percent%', newItem.percent + '%');
                }
            }
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        displayBudget: function(data) {
            var type;
            
            data.budget > -1 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(data.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(data.totals.inc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(data.totals.exp, 'exp');

            
            if(data.percent > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = data.percent + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
            
        },
        
        delItem: function(el) {
            var element = document.getElementById(el);
            
            element.parentNode.removeChild(element);
        },
        
        displayMonthYear: function(){
            var now = new Date();
            
            var year = now.getFullYear();
            var month = now.getMonth();
            
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            document.querySelector(DOMstrings.monthLabel).textContent = months[month] + ' ' + year;
            
        },

        changeState: function(){
            
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            
            var nodeListForEach = function(list, callback){
                for(var i = 0; i < list.length; i++) {
                    callback(list[i]);
                }
            };
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        }  
    }
    
})();

var controller = (function(budgetCtrl, UICtrl){
    
    var DOM = UICtrl.getDomstrings();
    
    var setupEventListeners = function() {
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem); 
        
        window.addEventListener('keypress', function(event) {
            
            if(event.keyCode === 13 || event.which === 13 ) {
                ctrlAddItem();
            }
            
        });
        
        document.querySelector(DOM.listItemContainer).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeState);
        
    };
    
    var ctrlAddItem = function(){
        var newItem;
        var newInput = UICtrl.getInput();
        
        if(newInput.description !== '' && newInput.value > 0) {
            newItem = budgetCtrl.addNewItem(newInput);
            
            updateBudget();
            
            UICtrl.displayNewItem(newItem, newInput.type);
            
            UICtrl.clearFields();
            
        }
        
    };
    
    var ctrlDeleteItem = function(event){
        
        var el = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        var fullID = el.split('-');
        
        var type = fullID[0];
        var id = parseInt(fullID[1]);
        
        budgetCtrl.deleteItem(type, id);
        
        UICtrl.delItem(el);
        
        updateBudget();
        
    };
    
    var updateBudget = function(){
        
        budgetCtrl.calculateBudget();
        var budget = budgetCtrl.getBudget();
            
        UICtrl.displayBudget(budget);
    }
    
    return {
            
            init: function() {
                
                setupEventListeners();
                
                var budget = budgetCtrl.getBudget();
                UICtrl.displayBudget(budget);
                
                UICtrl.displayMonthYear();
                
            }
    }

    
})(budgetController, UIController);

controller.init();