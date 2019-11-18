var tickers;
var tokens;
var basePrice;
var totalUSD = 0;
var totalETH = 0;
var hasConnected = false;
var balReady = 0;
var walReady = 0;
var orderReady = 0;
var gotMarket = false;
tokenIndex = 0;
var numberSocketToSend = 100;
var timer;
var account = window.location.href.split('?').pop();
console.log(account);
var socket = io.connect('https://socket.switchdex.ag:8443',{resource: 'socket/socket.io','force new connection': true});


socket.on('connect', function(){
  console.log("connected");
  if (gotMarket == false ){
  timer = setInterval(GetMarket, 5000);
    socket.emit("getMarket", {});
  }


});



socket.on('tokens',function(data){
  console.log("tokens");
    clearInterval(timer);
    gotMarket = true;
  var tempTokens = data.tokens;
  for (var i=0;i<tempTokens.length;i++){
    tempTokens[i].balance = 0;
    tempTokens[i].walletbalance = 0;
    tempTokens[i].onorders = 0;
  }
  let result = Object.values(tempTokens.reduce((r, o) =>  {
      r[o.name] = r[o.name] || {...o};
      return r;
    },{}));
  tokens = result;
  GetEthPrice(tokens);
  //FillTable(tokens);
});
console.log("emitted market");

socket.on('market',function(data){
  console.log("got market back");
  tickers = data.returnTicker;
  socket.emit("getTokens",{});
});

socket.on('walletBalance',function(data){
  HandleWalletBalance(data);
  walReady = walReady + 1;

});
socket.on('balances', function(data){
  HandleBalances(data.balances);
});
socket.on('balance', function(data){
//  console.log(data)
  HandleBalance(data.token);
  balReady = balReady + 1;


});
socket.on('OnOrders',function(data){
  HandleOrders(data);
  orderReady = orderReady + 1;
  if (orderReady == numberSocketToSend){
    orderReady = 0;
  tokenIndex = tokenIndex + numberSocketToSend;
  GetSDEXBalances();
  }

});

socket.on('disconnect', function(reason){
  console.log("disconnected: " + reason);
  hasConnected = true;
});

var curScroll = 0;

$('#bodyContainer').bind('mousewheel DOMMouseScroll',function (e) {
  console.log("scroll");
  var evt = window.event || e;
  var delta = evt.detail ? evt.detail * (-120) : evt.wheelDelta;
  var loc = $('#balanceTableDIV').scrollTop() + $('#balanceTableDIV').innerHeight();
  var height = $('#balanceTableDIV')[0].scrollHeight - 10;
  var height2 = $('#balanceTableDIV')[0].scrollHeight - $('#balanceTableDIV').innerHeight();
  if (delta < 0) {
    //scroll down
    if (curScroll < height2) {
      curScroll += 10;
    }
  }
  else {
    //scroll up
    if (curScroll > 0) {
      curScroll -= 10;
    }
  }
  if (loc >= height && !$('#balanceTableDIV').hasClass('appended')) {
    var moreContent = '<a href="google.com">a link</a>';
    $('#balanceTableDIV').append(moreContent);
    $('#balanceTableDIV').addClass('appended');
    console.log('appended');
  }
  $('#balanceTableDIV').scrollTop(curScroll);
  return true;
});

$("#balanceSearchBox").on('input', function(e){
  HandleSearch(e.target.value);
});

$("#queryAllButton").on("click",function(e){
  QueryPress();
})

$("#checkbox-1").change(function(){
  if (this.checked){
    HideZeroBalances();
  } else {
    ShowZeroBalances();
  }
})
function GetMarket(){
  console.log("Send market");
  socket.emit("getMarket", {});
}
function OpenMarket(token){
  var url = "https://switchdex.ag/#" + token + "-ETH";
  var newWindow = window.open(url,'_blank');
  newWindow.focus();
}

function HandleOrders(data){
  var token = data.token;
  var base = data.base;
  var user = data.user;
  var buys = data.buys;
  var sells = data.sells;
  var totalOrders = 0;
  if (token == base){
  for (var i=0;i<buys.length;i++){
    var amount = parseFloat(buys[i].availableVolume);
    amount = amount / Math.pow(10,18);
    //token.onorders = token.onorders + amount;
    totalOrders = totalOrders + amount;
  }
}
  if (token != base){
  for (var x=0;x<sells.length;x++){
    var amount = parseFloat(sells[x].availableVolume);
    amount = amount / Math.pow(10,18);
    //t/oken.onorders = token.onorders + amount;
    totalOrders = totalOrders + amount;
  }
}
  var td = document.getElementById("onorders" + token.toLowerCase());
  if (totalOrders > 0){
    totalOrders = totalOrders.toFixed(5);
    var matched = TokenMatches(token);
    matched[0].onorders = totalOrders;
    //UpdateTotalUSD(token,totalOrders);
    //UpdateTotalETH(token,totalOrders);
    td.innerHTML = totalOrders;
  } else {
    var matched = TokenMatches(token);
    matched[0].onorders = 0;
    td.innerHTML = 0;
  }

}
function HideZeroBalances(){
  for (var i=0;i<tokens.length;i++){
    if (tokens[i].balance || tokens[i].walletbalance){
      if (tokens[i].balance == 0 && tokens[i].walletbalance == 0){
        var row = document.getElementById("row" + tokens[i].name.toLowerCase());
        row.style.display = "none";
      }
    } else {
      var row = document.getElementById("row" + tokens[i].name.toLowerCase());
      row.style.display = "none";
    }
  }
}
function ShowZeroBalances(){
  for (var i=0;i<tokens.length;i++){
    if (tokens[i].balance == 0 && tokens[i].walletbalance == 0){
      var row = document.getElementById("row" + tokens[i].name.toLowerCase());
      row.style.display = "table-row";
    }
  }
}
function HandleBalances(balances){
  for(var i=0;i<balances.length;i++){
    var td = document.getElementById("sdexbalance" + balances[i].address.toLowerCase());
    var balance = balances[i].balance / Math.pow(10,18)
    balance = balance.toFixed(5);
    td.innerHTML = balance;
  }
}
function HandleBalance(token){
  var td = document.getElementById("sdexbalance" + token.address.toLowerCase());
  if (token.balance > 0){
  var matched = TokenMatches(token.address);
  var balance = token.balance / Math.pow(10,18)
  balance = balance.toFixed(5);
  matched[0].balance = balance;
  if (token.address == "0x0000000000000000000000000000000000000000"){
    UpdateTotalUSD2(token.address,balance);
    UpdateTotalETH2(token.address,balance);
  } else {
    UpdateTotalUSD(token.address,balance);
    UpdateTotalETH(token.address,balance);
  }

  td.innerHTML = balance;
} else {
  var matched = TokenMatches(token.address);
  matched[0].balance = 0;
  td.innerHTML = 0;
}
}

function HandleWalletBalance(data){
  if (data.balance){
    var token = data.address;
    var user = data.user;
    var balance = data.balance;
    var td = document.getElementById("walletbalance" + token.toLowerCase());
    if (balance > 0) {
      var matched = TokenMatches(token);
      balance = balance / Math.pow(10,18);
      balance = balance.toFixed(3);
      matched[0].walletbalance = balance;
     // UpdateTotalUSD(token,balance);
     // UpdateTotalETH(token,balance);
      td.innerHTML = balance;
    } else {
      var matched = TokenMatches(token);
      matched[0].walletbalance = 0;
      td.innerHTML = 0;
    }
  } else {
    var td = document.getElementById("walletbalance" + data.address.toLowerCase());
    var matched = TokenMatches(data.address);
    matched[0].walletbalance = 0;
    td.innerHTML = 0;
  }


}

function UpdateTotalETH(token,balance){
  var tempToken = TokenMatches(token);
  if (tempToken[0].price){
  var tempTotal = balance * tempToken[0].price;
  totalETH = totalETH + tempTotal;
  var usdField = document.getElementById("totalEthSpan");
  usdField.innerHTML = "" + totalETH.toFixed(4) + " ETH";
}
}

function UpdateTotalUSD2(token,balance){
  var tempToken = TokenMatches(token);
  var tempTotal = balance * basePrice;
  totalUSD = totalUSD + tempTotal;
  var usdField = document.getElementById("totalUSDSpan");
  usdField.innerHTML = "$" + totalUSD.toFixed(2) + "";
}
function UpdateTotalETH2(token,balance){
  var tempToken = TokenMatches(token);
  var tempTotal = parseFloat(balance);
  totalETH = totalETH + tempTotal;
  console.log(totalETH);
  var usdField = document.getElementById("totalEthSpan");
  usdField.innerHTML = "" + totalETH.toFixed(4) + " ETH";
}

function UpdateTotalUSD(token,balance){
  var tempToken = TokenMatches(token);
  if (tempToken[0].price){
  var tempTotal = (balance * tempToken[0].price) * basePrice;
  totalUSD = totalUSD + tempTotal;
  var usdField = document.getElementById("totalUSDSpan");
  usdField.innerHTML = "$" + totalUSD.toFixed(2) + "";
}
}
function HandleSearch(text){
  //EmptyTable();
  HideAll();
  var matches = TokenMatches(text);
  for (var i=0;i<matches.length;i++){
    UnHideRow(matches[i]);
  }
}
function TokenMatches(text){
 var as=$(tokens).filter(function (i,n){return n.name.toLowerCase().includes(text.toLowerCase()) || n.addr.toLowerCase().includes(text.toLowerCase()) || n.name.toUpperCase().includes(text.toUpperCase()) || n.addr.toUpperCase().includes(text.toUpperCase())});
 return as;
}

function GetEthPrice(tokens){
  var base = "ETH";
  var data1 = {
    "function": "GetBasePrice",
    "token": base,
    "contract": "Any",
    "name": base,
    "decimals": "18",
    "balance": "1"
  };

  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://node.clearpoll.com:8443/Explorer",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Accept": "*/*",
      "Cache-Control": "no-cache",
      "Postman-Token": "8eb0102e-0971-4585-b790-1a315e2d3ab6,c2ecc056-1d50-4cef-b1d8-3cd80641f9fe",
      "cache-control": "no-cache"
    },
    "processData": false,

    "data": JSON.stringify(data1)

  };

  var request = $.ajax(settings);
  request.done(function (response) {
    basePrice = JSON.parse(response).ethPrice;
    console.log(response);
    FillTable(tokens);
  });
  request.fail(function() {
    basePrice = 0;
    FillTable(tokens);
  });
}


function FillTable(tokens){
  //console.log(tokens);

  for(var i=0;i<tokens.length;i++){
    $.each(tickers, function(key, value) {
        if (value.tokenAddr == tokens[i].addr){
          tokens[i].price = value.last;
        }
    });
    CreateRow(tokens[i],basePrice);
  }
  document.getElementById("balanceTableID").style.display = "table";
  document.getElementById("Loading").style.display = "none";
  GetWalletBalances();
  GetSDEXBalances();
  GetOnOrders();


}
function GetOnOrders(){
  console.log("getting orders");

}
function GetWalletBalances(){
  console.log("getting wallet");

}
function GetSDEXBalances(){
  console.log("sending");
  for (var i = tokenIndex; i < tokenIndex + numberSocketToSend; i++) {
    socket.emit("getBalance", {
      "token": tokens[i].addr,
      "user": account
    })
    socket.emit("GetOnOrders", {
      "token": tokens[i].addr,
      "user": account
    })
    socket.emit("GetWalletBalance", {
      "token": tokens[i].addr,
      "user": account
    });
  }
}
function QueryPress(){
  console.log("sending");
  for (var i=0;i<tokens.length;i++){
    socket.emit("getBalance",{"token": tokens[i].addr,"user":account})
  }
//  socket.emit("getBalances",{"user": account});
}
function SingleQuery(token){
}

function EmptyTable(){
  var table = document.getElementById("tableBalances")
  var nodes = table.querySelectorAll('.balanceTR');
  for(let i = 0, j = nodes.length; i < j; i++) {
    nodes[i].remove()
  }
}
function HideAll(){
  var table = document.getElementById("tableBalances")
  var nodes = table.querySelectorAll('.balanceTR');
  for(let i = 0, j = nodes.length; i < j; i++) {
    nodes[i].style.display = "none";
  }
}
function UnHideRow(token){
  var row = document.getElementById("row" + token.name.toLowerCase());
  row.style.display = "table-row";
}
function CreateRow(token){
//  console.log("running");
  var tr = document.createElement("tr");
  tr.className = "balanceTR";
  tr.id = "row" +  token.name.toLowerCase();

  var td1 = document.createElement("td");
  td1.innerHTML = token.name;
  tr.appendChild(td1);

  var td2 = document.createElement("td");
  td2.innerHTML = "<a href=https://etherscan.io/token/" + token.addr + " target='_blank'>" + token.addr + " </a>";
  tr.appendChild(td2);

  var td3 = document.createElement("td");
  td3.innerHTML = 'Loading...';
  td3.id = "walletbalance" + token.addr.toLowerCase();
  tr.appendChild(td3);
  //amount on sdex
  var td4 = document.createElement("td");
  td4.id = "sdexbalance" + token.addr.toLowerCase();
  td4.innerHTML = "Loading...";
  tr.appendChild(td4);

  var td5 = document.createElement("td");
  td5.innerHTML = "Loading...";
  td5.id = "onorders" + token.addr.toLowerCase();
  tr.appendChild(td5);

  //last price
  var td6 = document.createElement("td");
  if (token.price){
    var price = token.price * basePrice;
    td6.innerHTML = "$" + price.toFixed(2);
  } else {
    td6.innerHTML = "$0.00";
  }
  tr.appendChild(td6);

  var td7 = document.createElement("td");
  td7.innerHTML = '<button type="button" onClick="OpenMarket(\'' + token.name + '\')" class="walletDepositButton">Open Market</button>';
  tr.appendChild(td7);

  document.getElementById("tableBalances").appendChild(tr);
}


function GetBalances(){
  /**
  self.utility.call(self.web3, self.contractSwitchDex, self.selectedContract, "balanceOf", [token.addr, self.accounts[self.selectedAccount].addr], function(err, result) {
      var balance = result;
      **/
}
