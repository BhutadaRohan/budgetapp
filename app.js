//BUDGET CONTROLLER
var budgetContrller = (function(){
	//two separate clsses for income nd expense
	var Expense = function(id,description,value){
		this.id=id;
		this.description=description;
		this.value=value;
		this.percentage=-1;
	};

	Expense.prototype.calcPercentage = function(totalIncome){

		if(totalIncome>0){
			this.percentage=Math.round((this.value/totalIncome)*100);
		}else{
			this.percentage=-1
		}
	};

	Expense.prototype.getPercentage = function(){
		return this.percentage;
	};

	var Income = function(id,description,value){
		this.id=id;
		this.description=description;
		this.value=value;
	};
	var calculateTotal = function(type){
		var sum =0;
		data.allItems[type].forEach(function(cur){
			sum = sum + cur.value;
		});
		data.totals[type]=sum;
	};
	//some code
	var data={
		allItems:{
			exp:[],
			inc:[]
		},
		totals:{
			exp:0,
			inc:0
		},
		budget:0,
		percentage:-1
	};

	return{
		addItem:function(type,des,val){
			var newItem,ID;
			if (data.allItems[type].length>1){
				ID=data.allItems[type][data.allItems[type].length-1].id+1
			}
			else{
				ID=0
			}
			if (type==='exp'){
				newItem = new Expense(ID,des,val);
			}else if(type==='inc'){
				newItem = new Income(ID,des,val);
			}

			data.allItems[type].push(newItem);
			return newItem;
		},
		deleteItem:function(type,id){
			var ids=data.allItems[type].map(function(current){
				return current.id;
			});

			var index= ids.indexOf(id)
			if (index !== -1){
				data.allItems[type].splice(index, 1)
			}
		},
		calculateBudget:function(){
			//calculate total income and total expenses
			calculateTotal('exp');
			calculateTotal('inc');
			//calculate budget=income - expenses
			data.budget = data.totals.inc-data.totals.exp;
			//calculate the percentage of income that we spent
			data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
		},
		calculatePercentages:function(){

			data.allItems.exp.forEach(function(cur){
				cur.calcPercentage(data.totals.inc)
			});
		},

		getPercentages: function(){

			var allPerc = data.allItems.exp.map(function(cur){
				return cur.getPercentage();
			});
			return allPerc;
		},

		getBudget:function(){
			return{
				budget:data.budget,
				totalinc:data.totals.inc,
				totalexp:data.totals.exp,
				percentage:data.percentage
			}
		},
		testings:function(){
			console.log(data)
		}
	}


})();

//UI CONTROLLER
var UIController =(function(){
	
	//some code
	var DOMstrings={
		inputType:'.add__type',
		inputDescription:'.add__description',
		inputValue:'.add__value',
		inputbtn:'.add__btn',
		incomeContainer:'.income__list',
		expenseContainer:'.expenses__list',
		budgetLabel:'.budget__value',
		incomeLabel:'.budget__income--value',
		expensesLabel:'.budget__expenses--value',
		percentageLabel:'.budget__expenses--percentage',
		container:'.container',
		expenesesPercentageLabel:'.item__percentage',
		dateLabel:'.budget__title--month'
		
	}
	var formatNumber = function(num,type){
			//+ or - before number & exactly 2 decimal points & comma separating of thousands

			num = Math.abs(num);
			num = num.toFixed(2);

			var numSplit = num.split('.');
			var int = numSplit[0];
			var dec = numSplit[1];

			if (int.length > 3){
				int = int.substr(0,int.length - 3)+','+int.substr(int.length-3,3);
			}

			return (type === 'exp' ? '-' :'+')+int+'.'+dec;
	};
	var nodeListForEach =function(list,callback){

				for (var i=0;i<list.length;i++){
					callback(list[i],i);
				}

	};
	return{
		getInput:function(){
			return{
				type:document.querySelector(DOMstrings.inputType).value,//will be inc or exp
				description:document.querySelector(DOMstrings.inputDescription).value,
				value:parseFloat(document.querySelector(DOMstrings.inputValue).value)
			}
		},

		addListItem:function(obj, type){
			//create html strings with placeholder text
			if (type==='inc'){
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}else if(type==='exp'){
				element = DOMstrings.expenseContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			//replace the placeholder text with some actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%',obj.description)
			console.log(formatNumber(obj.value,type))
			newHtml = newHtml.replace('%value%',formatNumber(obj.value,type))
			
			//insert the html into DOM
			document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);

		},

		deleteListItem:function(selectorID){
			var el =document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},
		clearFields:function(){
			var fields = document.querySelectorAll(DOMstrings.inputDescription +','+DOMstrings.inputValue);

			var fieldsArr = Array.prototype.slice.call(fields);
		
			fieldsArr.forEach(function(current,index,array){
				current.value="";
			});
			fieldsArr[0].focus();
		},

		displayBudget:function(obj){

			obj.budget < 0 ? type = 'exp' : type = 'inc'
			document.querySelector(DOMstrings.budgetLabel).textContent=formatNumber(obj.budget,type);
			document.querySelector(DOMstrings.incomeLabel).textContent=formatNumber(obj.totalinc,'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent=formatNumber(obj.totalexp,'exp');
			

			if(obj.percentage > 0 && obj.percentage <= 100){
				document.querySelector(DOMstrings.percentageLabel).textContent=obj.percentage+'%';
			}
			else{
				document.querySelector(DOMstrings.percentageLabel).textContent="---";
			}
		},

		displayPercentages: function(percentages){

			var fields = document.querySelectorAll(DOMstrings.expenesesPercentageLabel);
					
			
			nodeListForEach(fields,function(current,index){
				if(percentages[index] > 0){
					current.textContent = percentages[index] +'%';
				}else{
					current.textContent = '---'
				}
			});


		},
		displayMonth:function(){

			var now = new Date();
			var months =['January','February','March','April','May','June','July','August','September','October','November','December'];
			var month = now.getMonth();
			var year= now.getFullYear();
			document.querySelector(DOMstrings.dateLabel).textContent=months[month]+'-'+year;
		},
		
		changedType:function(){

			var fields = document.querySelectorAll(
				DOMstrings.inputType+','+
				DOMstrings.inputDescription+','+
				DOMstrings.inputValue);

			nodeListForEach(fields,function(cur){
				cur.classList.toggle('red-focus');
			});

			document.querySelector(DOMstrings.inputbtn).classList.toggle('red');
		},

		getDOMstrings:function(){
			return DOMstrings;
		}
	}
})();



//global app controller
var controller = ( function(budgetctrl,UIctrl){

	var setupEventListener=function(){
		document.querySelector(DOM.inputbtn).addEventListener('click',ctrlAddItem);

		document.addEventListener('keypress',function(event){
			if(event.keyCode === 13 || event.which === 13){
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
		
		document.querySelector(DOM.inputType).addEventListener('change',UIctrl.changedType);
	};

	var updatePercentages = function(){
		//1.calculate percentages
		budgetctrl.calculatePercentages();
		//2.read percentages from budget controller
		var percentages = budgetctrl.getPercentages();
		
		//3.update the percentages
		UIctrl.displayPercentages(percentages);
	
	}

	var updateBudget = function(){
		//1.calculate the budget
		budgetctrl.calculateBudget();
		//2.return the budget
		var budget =budgetctrl.getBudget();
		//3.display the budget on UI
		UIctrl.displayBudget(budget);
	};

	var DOM =UIctrl.getDOMstrings();
	var ctrlAddItem = function(){
		//1.get the field input data
		var input = UIctrl.getInput();
		
		if(input.description !== "" && !(isNaN(input.value)) && input.value>0){
		//2.add the item to budget controller
		var newItem = budgetctrl.addItem(input.type,input.description,input.value);
		
		//3.add the item to UI
		UIctrl.addListItem(newItem, input.type);

		// 4.clear the fields
		UIctrl.clearFields();
		
		//5.calculate & update the budget
		updateBudget();

		//6.update percentages
		updatePercentages();

		}
	};	

	var ctrlDeleteItem = function(event){
		var splitID,type,ID;
		var itemId = event.target.parentNode.parentNode.parentNode.parentNode.id
		
		if (itemId){
			//inc-1 format
			splitID = itemId.split('-');
			type=splitID[0];
			ID=parseInt(splitID[1]);

			//1.delete the item from data structure
			budgetctrl.deleteItem(type,ID);
			//2.delete the item from the UI
			UIctrl.deleteListItem(itemId);
			//3.update and shpw the new Budget
			updateBudget();
			//4.update the percentage of expenses
			updatePercentages();
		}
	};

	return{
		init:function(){
			console.log("Application has started");
			UIctrl.displayMonth();
			UIctrl.displayBudget({
				budget:0,
				totalinc:0,
				totalexp:0,
				percentage:-1
			})
			setupEventListener();
		}
	};

	})(budgetContrller,UIController);

	controller.init();