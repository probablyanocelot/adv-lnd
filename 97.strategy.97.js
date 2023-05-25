let Strategy = function () {
    this.strategy = null
};

Strategy.prototype = {
    setStrategy: function (strategy) {
        this.strategy = strategy;
    },

    init: async function (context) {
        return await this.strategy.init(context);
    }
};

class Farm {
    init(context) {
        smart_move(context.location);
        return init;
    }
};

class Goo {
    context = {
        location: "goo"
    }
}

let strategy = new Strategy();
let farm = new Farm();
// let goo = new Farm();

// let USPS = function () {
//     this.calculate = function (package) {
//         // calculations...
//         return "$39.40";
//     }
// };

// let Fedex = function () {
//     this.calculate = function (package) {
//         // calculations...
//         return "$43.20";
//     }
// };

// function run() {

//     let package = { from: "76712", to: "10012", weigth: "lkg" };

//     // the 3 strategies

//     let ups = new UPS();
//     let usps = new USPS();
//     let fedex = new Fedex();

//     let shipping = new Shipping();

//     shipping.setStrategy(ups);
//     console.log("UPS Strategy: " + shipping.calculate(package));
//     shipping.setStrategy(usps);
//     console.log("USPS Strategy: " + shipping.calculate(package));
//     shipping.setStrategy(fedex);
//     console.log("Fedex Strategy: " + shipping.calculate(package));
// }

