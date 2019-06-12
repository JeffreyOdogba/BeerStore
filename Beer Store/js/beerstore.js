		//cart variable
		var cartList = []; // name, quantity, imgsrc, price, subTotalPrice
		var beerSelection = "Ale";
		//variable for showing json file
		var beer, beerName, beerPrice, imageURL, alcoholContent;
		var cnt = 0;
		var beerNum = 0;
		$(document).on("pagecreate", "#mainPage", function () {
			$("#sideMenu1").removeClass("show");
			var myPosition = new google.maps.LatLng(43.482266, -79.694517);
			var defaultOptions = {
				zoom: 15
				, mapTypeId: google.maps.MapTypeId.ROADMAP
				, center: myPosition
			}
			var map = new google.maps.Map(document.getElementById("map-canvas"), defaultOptions);
			var marker = new google.maps.Marker({
				position: myPosition
				, map: map
				, title: "Welcome to BeerMore!"
			});
			$(".beerSelection").click(function () {
				beerSelection = $(this).html();
			});
		});
		$(document).on("pageshow", "#aboutPage", function () {
			$("#sideMenu1").removeClass("show");
		});
		$(document).on("pageshow", "#storePage", function () {
			$("#sideMenu1").removeClass("show");
			$("#beerType").on("change", function (e) {
				beerSelection = $(this).find("option:selected").text();
				readJson();
			});
			$("#beerType").val(beerSelection).change();
		});

		function readJson() {
			$.getJSON("beerstore.json", function (data) {
				$("#beerList").html("");
				if (beerSelection == "Ale") showBeerList(data.Ale);
				else if (beerSelection == "Malt") showBeerList(data.Malt);
				else showBeerList(data.Stout);
			});
		}

		function showBeerList(beerType) {
			checkEven = 0;
			$.each(beerType, function () {
				if (checkEven == 0) {
					beerName = this.beername;
					imageURL = this.image;
					beerPrice = this.price;
					alcoholContent = this.alcoholContent;
					checkEven++;
				}
				else {
					beer = "<div class='row'><div class='col colPic' id='" + (beerNum++) + "' style='background-image: url(" + imageURL + "); '></div>" + "<div class='col colPic' id='" + (beerNum++) + "' style='background-image: url(" + this.image + "); '></div></div>";
					beer += "<div class='row'><div class='col'><center><strong><span id='" + (beerNum - 2) + "BeerName'>" + beerName + "</span></strong><br><span id='" + (beerNum - 2) + "price'>" + beerPrice + "</span><br>" + alcoholContent + "</center></div>" + "<div class='col'><center><strong><span id='" + (beerNum - 1) + "BeerName'>" + this.beername + "</span></strong><br><span id='" + (beerNum - 1) + "price'>" + this.price + "</span><br>" + this.alcoholContent + "</center></div></div>";
					$("#beerList").append(beer);
					checkEven = 0;
				}
			});
			// tap beer on the list
			$(".col").tap(function () {
				$("#cart").html(++cnt);
				beerId = $(this).attr('id');
				beerName = $("#" + beerId + "BeerName").html();
				isInCart = false;
				for (i = 0; i < cartList.length; i++) {
					if (cartList[i][0] == beerName) {
						isInCart = true;
						cartList[i][1]++;
						isInCart = true;
					}
				}
				if (!isInCart) {
					len = cartList.length;
					cartList[len] = [];
					cartList[len][0] = beerName;
					cartList[len][1] = 1;
					cartList[len][2] = $(this).css('background-image');
					cartList[len][3] = $("#" + beerId + 'price').html();
				}
			});
			$(".col").mouseover(function () {
				$(this).css('opacity', 0.5);
				$(this).css('cursor', "pointer");
			});
			$(".col").mouseleave(function () {
				$(this).css('opacity', 1);
			});
		}
		$(document).on("pageshow", "#cartPage", function () {
			$("#sideMenu1").removeClass("show");
			if (cartList.length == 0) {
				$("#orderButton").attr("disabled", true);
			}
			else {
				$("#orderButton").attr("disabled", false);
			}
			for (i = 0; i < cartList.length; i++) {
				if (cartList[i][3] == null || cartList[i][3] == undefined) continue;
				cartList[i][3] = parseFloat(cartList[i][3].substr(1));
				price = (cartList[i][3] * cartList[i][1]).toFixed(2);
				cartList[i][4] = price;
				form = "<div><table><tr style='vertical-align: middle;'><td><button class='MButton'><i class='fas fa-minus-square MPSquare'></i></button></td><td><input type='text' class='quantity' id='" + i + "Quantity' size='1' value=" + cartList[i][1] + " readonly></td><td><button class='PButton'><i class='fas fa-plus-square MPSquare'></i></button></td></tr></table></div>";
				str = "<table class='cartTable'><tr><td rowspan='3' style='width:30%; text-align:center;'><div class='cartImg' style='background-image:" + cartList[i][2] + ";'></td><td><strong>" + cartList[i][0] + "</strong></td></tr><tr><td>" + form + "</td></tr><tr><td id='" + i + "SubTotal' style='border-bottom-left-radius:10px; border-bottom-right-radius:10px;'>$" + price + "</td></tr></table>";
				$("#cartDiv").append(str);
			}
			calTotal();
			$(".MButton").click(function () {
				beerIdinCart = $(this).closest("tr").find(".quantity").attr('id');
				minusBeer(beerIdinCart);
			});
			$(".PButton").click(function () {
				beerIdinCart = $(this).closest("tr").find(".quantity").attr('id');
				plusBeer(beerIdinCart);
			});
			$(document).off('click', "#orderButton").on('click', "#orderButton", function (e) {
				var orderList = [];
				orderList[0] = [getTodayDate(), $("#datepicker").val(), $("#total").html()];
				for (i = 0; i < cartList.length; i++) {
					orderList[i + 1] = [];
					orderList[i + 1][0] = cartList[i][0];
					orderList[i + 1][1] = cartList[i][1];
				}
				if (localStorage.getItem("orderListStorage") == null || localStorage.getItem("orderListStorage") == undefined) {
					orderList1 = [];
					orderList1[0] = orderList;
					localStorage.setItem("orderListStorage", JSON.stringify(orderList1));
					orderList1 = JSON.parse(localStorage.getItem("orderListStorage"));
				}
				else {
					orderList1 = JSON.parse(localStorage.getItem("orderListStorage"));
					orderList1.push(orderList);
					localStorage.setItem("orderListStorage", JSON.stringify(orderList1));
				}
				cartList = [];
				cnt = 0;
				$("#cartDiv").html("<h4 style='font-weight: bold;'>Your Cart</h4></div>");
			});
		});

		function getTodayDate() {
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth() + 1; //January is 0!
			var yyyy = today.getFullYear();
			if (dd < 10) {
				dd = '0' + dd;
			}
			if (mm < 10) {
				mm = '0' + mm;
			}
			today = mm + '/' + dd + '/' + yyyy;
			return today;
		}

		function minusBeer(beerIdinCart) {
			quantity = $("#" + beerIdinCart).val();
			if (quantity == 0) return false;
			$("#" + beerIdinCart).val(--quantity);
			cartNum = beerIdinCart.substr(0, 1);
			cartList[cartNum][1]--;
			cartList[cartNum][4] = (cartList[cartNum][3] * quantity).toFixed(2);
			$("#" + beerIdinCart.substr(0, 1) + "SubTotal").html("$" + cartList[cartNum][4]);
			calTotal();
		}

		function plusBeer(beerIdinCart) {
			quantity = $("#" + beerIdinCart).val();
			$("#" + beerIdinCart).val(++quantity);
			cartNum = beerIdinCart.substr(0, 1);
			cartList[cartNum][1]++;
			cartList[cartNum][4] = (cartList[cartNum][3] * quantity).toFixed(2);
			$("#" + beerIdinCart.substr(0, 1) + "SubTotal").html("$" + cartList[cartNum][4]);
			calTotal();
		}

		function calTotal() {
			subTotal = 0;
			for (i = 0; i < cartList.length; i++) {
				if (isNaN(Number(cartList[i][4]))) continue;
				subTotal += Number(cartList[i][4]);
			}
			tax = subTotal * 0.13;
			total = subTotal + tax;
			$("#subTotal").html(subTotal.toFixed(2));
			$("#tax").html(tax.toFixed(2));
			$("#total").html(total.toFixed(2));
		}
		$(document).on("pageshow", "#myOrderPage", function () {
			$("#myOrderDiv").html("<h4 style='font-weight: bold; margin-bottom: 4%'>Your Order</h4>");
			var orderList = JSON.parse(localStorage.getItem("orderListStorage"));
			var a = ""
				, b = "";
			for (i = 0; i < orderList.length; i++) {
				a += "<table style='width:100%'><td style='width:10%; font-size:1.5em;'><strong>" + (i + 1) + "</strong></td><td><table class='myOrderTable'><tr><td class='label'>Order Date</td><td calss='value'>" + orderList[i][0][0] + "</td></tr><tr><td class='label'>Pickup Date</td><td calss='value'>" + orderList[i][0][1] + "</td></tr><tr><td class='label'>Total Price</td><td calss='value'>$" + orderList[i][0][2] + "</td></tr><tr class='detailTr redColor'><td colspan='2'><hr><strong>Order Detail</strong></td></tr>";
				b = "";
				for (j = 1; j < orderList[i].length; j++) {
					b += "<tr><td class='detailBeerName'>" + orderList[i][j][0] + "</td><td>" + orderList[i][j][1] + "</td></tr>";
				}
				a += b;
				a += "</table></td></table>";
			}
			$("#myOrderDiv").append(a);
			$('.detailTr').nextAll().slideUp();
			$('.detailTr').click(function () {
				$(this).toggleClass('redColor');
				$(this).nextAll().slideToggle();
			});
		});