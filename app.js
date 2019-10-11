// ---------------------------- budget controller ------------------------------

var budgetController = (function() {
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};
	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};
	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(cur) {
			sum = sum + cur.value;
		});
		data.totals[type] = sum;
	};
	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	return {
		addItem: function(type, des, val) {
			var newItem, ID;

			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}

			if (type === "exp") {
				newItem = new Expense(ID, des, val);
			} else if (type === "inc") {
				newItem = new Income(ID, des, val);
			}

			data.allItems[type].push(newItem);

			return newItem;
		},

		deleteItem: function(type, id) {
			var ids, index;
			// id =3

			ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			index = ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},
		calculateBudget: function() {
			// calculate income and expenses
			calculateTotal("exp");
			calculateTotal("inc");
			/// calculate budget
			data.budget = data.totals.inc - data.totals.exp;
			// calculate the percentage of income that was spent

			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
		},

		calculatePercentages: function() {
			data.allItems.exp.forEach(function(current) {
				current.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function() {
			var allPerc = data.allItems.exp.map(function(cur) {
				return cur.getPercentage();
			});
			return allPerc;
		},

		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},

		testing: function() {
			console.log(data);
		}
	};
})();
// ---------------------------- UI controller ------------------------------
var UIController = (function() {
	var DOMstrings = {
		inputType: ".add__type",
		inputDescription: ".add__description",
		inputValue: ".add__value",
		btn: ".add__btn",
		incomeContainer: ".income__list",
		expensesContainer: ".expenses__list",

		container: ".container",

		expensesPercLabel: ".item__percentage",

		dateLabel: ".budget__title--month"
	};
	var formatNumber = function(num, type) {
		/* 
	  + or - before number
	  exactly 2 decimal points,
	  comma separating the thousands


	  */
		var numSplit, int, dec;

		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split(".");
		int = numSplit[0];
		dec = numSplit[1];
		if (int.length > 3) {
			int =
				int.substr(0, int.length - 3) +
				"," +
				int.substr(int.length - 3, int.length);
		}
		dec = numSplit[1];

		return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
	};

	var nodelistForeach = function(list, callback) {
		for (var i = 0; i < list.length; i++) {
			callback(list[i], i);
		}
	};

	return {
		getInput: function() {
			return {
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},
		addListItem: function(obj, type) {
			var html, newHtml, element;
			//create html string with placeholder text
			if (type === "inc") {
				element = DOMstrings.incomeContainer;
				html =
					'<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>  </div></div></div>';
			} else if (type === "exp") {
				element = DOMstrings.expensesContainer;
				html =
					'<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			//replace the placeholder text with some actual data
			newHtml = html.replace("%id%", obj.id);
			newHtml = newHtml.replace("%description%", obj.description);
			newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));
			// insers the html into the dom
			document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
		},

		deleteListItem: function(selectorID) {
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		clearFields: function() {
			var fields, fieldsArr;
			fields = document.querySelectorAll(
				DOMstrings.inputDescription + ", " + DOMstrings.inputValue
			);
			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function(current, index, array) {
				current.value = "";
			});

			fieldsArr[0].focus();
		},
		displayBudget: function(obj) {
			var type;
			obj.budget > 0 ? (tyoe = "inc") : (type = "exp");
			document.querySelector(".budget__value").textContent = formatNumber(
				obj.budget,
				type
			);

			document.querySelector(
				".budget__income--value"
			).textContent = formatNumber(obj.totalInc, "inc");
			document.querySelector(
				".budget__expenses--value"
			).textContent = formatNumber(obj.totalExp, "exp");

			if (obj.percentage > 0) {
				document.querySelector(".budget__expenses--percentage").textContent =
					obj.percentage + "%";
			} else {
				document.querySelector(".budget__expenses--percentage").textContent =
					"---";
			}
		},

		displayPercentages: function(percentages) {
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

			nodelistForeach(fields, function(current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + "%";
				} else {
					current.textContent = "---";
				}
			});
		},

		displayMonth: function() {
			var now, year, month, months;
			now = new Date();
			months = [
				"იანვარი",
				"თებერვალი",
				"მარტი",
				"აპრილი",
				"მაისი",
				"ივნისი",
				"ივლისი",
				"აგვისტო",
				"სექტემბერი",
				"ოქტომბერი",
				"ნოემბერი",
				"დეკემბერი"
			];
			month = now.getMonth();
			year = now.getFullYear();
			document.querySelector(DOMstrings.dateLabel).textContent =
				months[month] + " " + year;
		},
		changeType: function() {
			var field = document.querySelectorAll(
				DOMstrings.inputType +
					"," +
					DOMstrings.inputDescription +
					"," +
					DOMstrings.inputValue
			);
			nodelistForeach(field, function(current) {
				current.classList.toggle("red-focus");
			});

			document
				.querySelector(".ion-ios-checkmark-outline")
				.classList.toggle("red");
		},
		getDOMstring: function() {
			return DOMstrings;
		}
	};
})();
// ---------------------------- Global controller ------------------------------
var controller = (function(budgetCtrl, UICtrl) {
	//-----------------------------button pressed ---------------------------
	var setupEventisteners = function() {
		var DOMstrings = UICtrl.getDOMstring();
		document
			.querySelector(DOMstrings.btn)
			.addEventListener("click", ctrlAddItem);

		document.addEventListener("keypress", function(event) {
			if (event.keyCode === 13) {
				ctrlAddItem();
			}
			document
				.querySelector(DOMstrings.container)
				.addEventListener("click", CtrlDeleteItem);
		});

		document
			.querySelector(DOMstrings.inputType)
			.addEventListener("change", UICtrl.changeType);
	};
	var budget;
	var updateBudget = function() {
		//1 calculate the budget
		budgetCtrl.calculateBudget();
		// 2 return the budget
		budget = budgetCtrl.getBudget();
		//3. display budget
		console.log(budget);

		UICtrl.displayBudget(budget);
	};

	var updatePercentages = function() {
		// 1.calculate percentages
		budgetCtrl.calculatePercentages();

		// 2. read percentages from the budget ctrl
		var percentages = budgetCtrl.getPercentages();
		//3. update UI
		UICtrl.displayPercentages(percentages);
	};

	var ctrlAddItem = function() {
		// 1. get the3 field input data
		var input = UICtrl.getInput();

		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			// 2. add the item
			var newItem = budgetCtrl.addItem(
				input.type,
				input.description,
				input.value
			);

			// 3. add the new item to the UI
			UIController.addListItem(newItem, input.type);

			// 4. clear the fields
			UICtrl.clearFields();

			// 5.calculate  and update budget
			updateBudget();

			//6 calculate and update percentages
			updatePercentages();
		}
	};
	var CtrlDeleteItem = function(event) {
		var itemID, splitID, type, ID;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if (itemID) {
			splitID = itemID.split("-");
			type = splitID[0];
			ID = parseInt(splitID[1]);

			// 1.delete the item from the data structure
			budgetCtrl.deleteItem(type, ID);
			//2. delete item from the UI
			UICtrl.deleteListItem(itemID);
			// 3. update adn show the new budget
			updateBudget();
			updatePercentages();
		}
	};
	return {
		init: function() {
			setupEventisteners();
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: 0
			});
		}
	};
})(budgetController, UIController);

controller.init();
