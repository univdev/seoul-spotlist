function openPopupAddCard(idx){
	app.card.idx = idx;
	app.canvas.setting();
	var div = "<div title='카드 추가'>";

        div += "<div class='form-group'>";
            div += "<input type='text' class='form-control' id='cardTitle' placeholder='카드 제목'>";
        div += "</div>";

        div += "<div class='form-group'>";
            div += "<textarea class='form-control' id='cardDescription' placeholder='설명' rows='3'></textarea>";
        div += "</div>";

        div += "<div class='form-group'>";
            div += "<div id='image_area'>사진 영역</div>";
        div += "</div>";

        div += '<input type="file" id="fileUpload" class="hide">';

		div += "<div class='form-group toolbar'>";
			div += "<input type='button' value='브러시' class='btn brushBtn'> &nbsp;&nbsp;&nbsp;";
			div += "<div>"
				div += "<div>색상 선택</div>"
				div += "<select id='sel_shape' class='brushColor'>";
					div += "<option value='#ff0000'>RED</option>";
					div += "<option value='#00ff00'>GREEN</option>";
					div += "<option value='#0000ff'>BLUE</option>";
					div += "<option value='#ffff00'>YELLOW</option>";
					div += "<option value='#ff00f0'>PINK</option>";
					div += "<option value='#00fff0'>SKY BLUE</option>";
				div += "</select> &nbsp;&nbsp;&nbsp;";
			div += "</div>"

			div += "<div>";
				div += "<div>두께 조절</div>";
				div += "<input type='text' size='3' value='1' class='sizeInput' readonly='readonly'> ";
				div += "<input type='button' value='+' class='btn sizeSet'> ";
				div += "<input type='button' value='-' class='btn sizeSet'> (px)";
			div += "</div>"
		div += "</div>";

	div += "</div>";

    $(div).dialog({
      resizable: false,
      modal: true,
      width: 540,
      close: function(){
      	$('.ui-dialog').remove();
      },
      buttons: {
        "완료": function() {
          var title = $('#cardTitle').val();
          var description = $('#cardDescription').val();
          var error = [];

          if( ! title )
          	error.push('카드 제목을 입력해주세요 !');
          if( ! description )
          	error.push('설명을 입력해주세요 !');
          if( ! app.canvas.file )
          	error.push('사진 영역에 사진을 업로드해주세요 !');

          if(error.length){
          	alert(error.join('\n'));
          	return false;
          }

          app.card.appendData(title, description);

          $( this ).dialog( "close" );
        },
        "취소": function() {
          $( this ).dialog( "close" );
        }
      }
    });
}

function viewPhotoSlide(idx){
	app.preview.idx = idx;
	app.preview.setting();
	var div = "<div id='photoViewBg'>";

		div += "<div id='photoViewImage'>";
			div += "<img src='images/1.jpg' alt='카드명' title='카드명'>";
		div += "</div>";

		div += "<select id='photoViewSel'>";
			div += "<option>Bounce</option>";
			div += "<option>Fade</option>";
			div += "<option>Flip</option>";
		div += "</select>";

		div += "<input type='button' value='X' class='btn btn-primary' id='close_btn'>";
		div += "<input type='button' value='<' class='' id='prev_btn'>";
		div += "<input type='button' value='>' class='' id='next_btn'>";

		div += "<ul id='photoViewPos'>";
			div += "<li class='active'></li>";
			div += "<li></li>";
			div += "<li></li>";
		div += "</ul>";

	div += "</div>";

	$("body").prepend($(div));

	$("#close_btn").on("click", function (){
		$("#photoViewBg").remove();
	});
}

/**
 * Javascript Code
 * writer: 002
 * Description: 서울특별시 관광 어플리케이션
 */

var app = new Module();

/**
 * [Module description]
 * Application 전체 관리
 */
function Module(){

	/**
	 * [어플리케이션 시작 시 자동 실행되는 생성자]
	 * @return {[type]} [description]
	 */
	this.construct = function(){

		app.tour.hide();
	}

	var db = window.indexedDB.open('002_client_side', 1);
	db.onsuccess = function(event){
		var db = event.target.result;
		app.query.db = db;

		console.log('DB Success !');

		/* 데이터베이스 로드 후 실행되는 이벤트 */
		app.tour.findAll(function(){
			app.card.findAll();
		});
	}

	db.onupgradeneeded = function(event){
		var q = event.target.result;
		q.createObjectStore('place', {keyPath: 'idx', autoIncrement: true});
		q.createObjectStore('cards', {keyPath: 'idx', autoIncrement: true});
	}

	/**
	 * [Database 관련 설정 메소드]
	 * @type {Object}
	 */
	this.query = {
		db: null,

		add: function(table, data, func){

			var store = app.query.db.transaction(table, 'readwrite').objectStore(table);

			var request = store.add(data);
			request.onsuccess = function(){
				if(func)
					func(request.result)
			}
		},

		select: function(table, idx, func){

			var store = app.query.db.transaction(table, 'readwrite').objectStore(table);
			var request = store.get(idx);

			request.onsuccess = function(data){

				if(func)
					func(request.result);
			}
		},

		/**
		 * [delete 테이블에서 데이터 삭제]
		 * @param  {string} table [테이블명]
		 * @param  {int} idx   [인덱스 값]
		 * @param  {function} func  [리턴받을 함수]
		 */
		delete: function(table, idx, func){

			var store = app.query.db.transaction(table, 'readwrite').objectStore(table);

			var request = store.delete(idx);
			request.onsuccess = function(){
				if(func)
					func(request.result)
			}
		},

		update: function(table, idx, data, func){

			var store = app.query.db.transaction(table, 'readwrite').objectStore(table);

			var request = store.get(idx);
			request.onsuccess = function(){
				store.put(data);

				if(func)
					func(request.result);
			}
		},

		getAll: function(table, func){
			var store = app.query.db.transaction(table, 'readwrite').objectStore(table);

			var request = store.getAll();
			request.onsuccess = function(){

				if(func)
					func(request.result);
			}
		}
	}

	this.tour = {
		/**
		 * [관광지 추가 폼 오픈]
		 * @return {[type]} [description]
		 */
		open: function(time){

			$('#addForm').show(time);
			$('#addFormButton').hide(time);

			$('#addForm form #tourName').focus();
		},

		hide: function(time){

			$('#addForm').hide(time);
			$('#addFormButton').show(time);

			$('#addForm form')[0].reset();
		},

		findAll: function(func){
			app.query.getAll('place', function(data){

				$.each(data, function(key, obj){
					var html = app.tour.html(obj);
					app.tour.appendHTML(html);
				});

				if(func)
					func();
			});
		},

		appendData: function(obj){
			app.query.add('place', obj, function(idx){
				dd('정상적으로 관광지를 추가하였습니다 !');
				app.tour.hide();

				obj.idx = idx;
				var html = app.tour.html(obj);

				app.tour.appendHTML(html);

				app.card.sortable();
			});
		},

		html: function(obj){
			var idx = obj.idx;
			var title = obj.title;

	        var html = '<div class="tour-wrap tour" data-idx="'+idx+'">'
	            html += '<div>'
	                html += '<div class="w100">'
	                    html += '<span class="title tour-title">'+title+'</span>'
	                    html += '<input type="button" value="삭제(X)" data-idx="'+idx+'" class="btn btn-primary btn-delete tourDeleteBtn">'
	                html += '</div>'
	                html += '<div class="w100">'
	                    html += '<input type="button" value="사진 이어보기" class="btn btn-tour-photoview" onclick="viewPhotoSlide('+idx+');">'
	                html += '</div>'

	                html += '<div class="cardZip">';
	                html += '</div>';

	                html += '<input type="button" value="카드 추가" data-idx="'+idx+'" class="btn btn-primary btn-card-add" onclick="openPopupAddCard('+idx+');">'
	            html += '</div>'
	        html += '</div>'

	        return html;
		},

		appendHTML: function(html){
			$('#addForm').before(html);
		}
	},

	/**
	 * [card 카드 관련 메소드]
	 */
	this.card = {

		idx: null, // 카드를 추가하려는 관광지의 idx 값

		appendData: function(title, description){
			var obj = {};

			var target = $('.tour[data-idx="'+app.card.idx+'"]');
			var cnt = ss(target, '.cardZip > .card').length;
			var url = app.canvas.cvs.toDataURL();

			obj.title = title;
			obj.description = description;
			obj.parent = app.card.idx;
			obj.cnt = cnt;
			obj.image = url;

			app.query.add('cards', obj, function(idx){
				dd('카드 업로드 완료 !');
				obj.idx = idx;

				var html = app.card.html(obj);
				app.card.appendHTML(obj.parent, html);
			});
		},

		findAll: function(){

			app.query.getAll('cards', function(data){

				data = data.sort(function(a, b){
					var a = a.cnt;
					var b = b.cnt;

					return a > b ? 1 : a < b ? -1 : 0;
				});

				$.each(data, function(key, obj){
					var parent = obj.parent;

					var html = app.card.html(obj);
					app.card.appendHTML(parent, html);

					app.card.resize();
					app.card.sortable();
				});
			});
		},

		html: function(obj){
			var title = obj.title;
			var description = obj.description;
			var idx = obj.idx;
			var image = obj.image;

			var html = "";
            html += '<div class="card" data-idx="'+idx+'">'
                html += '<div class="w100">'
                html += '<p class="title">'+title+'</p>'
                    html += '<input type="button" value="X" class="btn btn-primary btn-delete cardDelete" data-idx="'+idx+'">'
                html += '</div>'
                html += '<img src="'+image+'">'
                html += '<p class="description">'
                    html += description;
                html += '</p>'
            html += '</div>'

            return html;
		},

		resize: function(){
			var target = $('.cardZip .card');

			$.each(target, function(){

				var img = $(this).find('img');
				var w = img.width();
				var h = img.height();

				if(w >= 230){
					var diff = 230 / w;
					w *= diff;
					h *= diff;
				}

				if(h >= 200){
					var diff = 200 /h;
					w *= diff;
					h *= diff;
				}

				img.attr({width: w, height: h});
			});
		},

		appendHTML: function(idx, html){

			var target = $('.tour[data-idx="'+idx+'"]');
			ss(target, '.cardZip').append(html);

			app.card.resize();
		},

		sortable: function(){
			$('.cardZip').sortable({
				connectWith: '.cardZip',
				start: function(e, ui){
					var ui = ui.item;
					$(ui).addClass('moving');
				},
				stop: function(){
					var target = $('.cardZip .card');
					$('.card.moving').removeClass('moving');

					$.each(target, function(){
						var parentIdx = $(this).parent().parent().parent().data('idx');
						var index = $(this).index();

						var idx = $(this).data('idx');

						var data = app.query.select('cards', idx, function(data){
							data.parent = parentIdx;
							data.cnt = index;

							app.query.update('cards', idx, data);
						});
					});
				}
			});
		}
	}

	/**
	 * [canvas 파일 업로드 관련 메소드]
	 * @type {Object}
	 */
	this.canvas = {
		cvs: null,
		ctx: null,
		file: null,
		startTimer: null,
		drawCheck: false,
		brushActive: false,

		setting: function(){
			this.file = null;
		},

		upload: function(){
			var file = this.file;
			var type = file.type;

			var access = ['image/jpg', 'image/jpeg', 'image/gif', 'image/png'];
			var error = false;

			if(access.indexOf(type) == -1){
				error = true;
			}

			if(error){
				alert('JPG(JPEG), PNG, GIF 이미지 파일만 가능합니다.');
				this.file = null;
				return false;
			}

			var canvas = '<canvas></canvas>';
			$('#image_area').html(canvas);

			this.cvs = $('#image_area canvas')[0];
			this.ctx = this.cvs.getContext('2d');

			var url = URL.createObjectURL(app.canvas.file);
			var image = new Image();
			image.onload = function(){
				app.canvas.image(image);
			}
			image.src = url;
		},

		image: function(image){
			var w = image.width;
			var h = image.height;

			if(w > 500){
				var diff = 500/w;
				w *= diff;
				h *= diff;
			}

			if(h > 300){
				var diff = 300/h;
				w *= diff;
				h *= diff;
			}

			$(app.canvas.cvs).attr({width: w, height: h});
			this.ctx.drawImage(image, 0, 0, w, h);
		},

		draw: function(x, y){

			if( ! this.brushActive){
				return false;
			}

			if( ! this.drawCheck){
				return false;
			}

			var color = $('select.brushColor').val();
			var size = $('.sizeInput').val();

			var ctx = this.ctx;

			if(size % 2){
				x += .5;
				y += .5;
			}

			ctx.strokeStyle = color;
			ctx.lineWidth = size;
			ctx.lineTo(x, y);
			ctx.stroke();
		}
	}

	this.preview = {
		idx: null,
		timer: null,
		visibleCard: true,
		spawnCardTimer: null,

		page: 1,
		filter: function(){
			var length = $('#photoViewPos li').length;

			if(this.page < 1)
				this.page = length;
			else if(this.page > length)
				this.page = 1;
		},
		setting: function(){
			app.preview.page = 1;
			clearTimeout(app.preview.timer);
			clearTimeout(app.preview.startTimer);

			app.preview.startTimer = setTimeout(function(){
				app.preview.page += 1;
				app.preview.move();
			}, 4000)
			var store = app.query.db.transaction('cards', 'readwrite').objectStore('cards');
			var result = [];

			store.openCursor().onsuccess = function(event){
				var cursor = event.target.result;

				if(cursor){
					var obj = cursor.value;
					if(obj.parent == app.preview.idx){
						result.push(obj);
					}
					cursor.continue();
				} else {
					result = result.sort(function(a, b){
						var a = a.cnt;
						var b = b.cnt;

						return a > b ? 1 : a < b ? - 1 : 0;
					});
					var img = $('#photoViewImage');
					var position = $('#photoViewPos');
					img.html('');
					position.html('');

					$.each(result, function(key, obj){
						var imgTag = '<img src="'+obj.image+'" alt="이미지">';
						if(key == 0)
							imgTag = '<img src="'+obj.image+'" class="first" alt="이미지">';
						img.append(imgTag);
						position.append('<li></li>');
					});

					app.preview.pos();
				}
			}
		},

		move: function(){

			var length = $('#photoViewPos li').length;
			clearTimeout(app.preview.timer);

			if( ! length )
				return false;

			app.preview.timer = setTimeout(function(){
				app.preview.page += 1;
				app.preview.filter();
				app.preview.move();
			}, 4000);

			var type = $('#photoViewSel').val().toLowerCase();
			if(type == 'fade')
				type = 'fades';

			$('#photoViewImage img').removeClass('bounce flip fades');
			$('#photoViewImage img').addClass(type);

			if(app.preview.visibleCard){
				var target = $('#photoViewImage .first, #photoViewImage .active')
				target.addClass('remove');
				target.removeClass('first active');

				app.preview.visibleCard = false;
			}

			clearTimeout(app.preview.spawnCardTimer);
			app.preview.spawnCardTimer = setTimeout(function(){
				var target = $('#photoViewImage img');
				$(target[app.preview.page-1]).removeClass('remove first');
				$(target[app.preview.page-1]).addClass('active');

				app.preview.visibleCard = true;
			}, 1500);

			this.pos();
		},

		pos: function(){
			var idx = this.page-1;
			var position = $('#photoViewPos li');
			position.removeClass('active');
			$(position[idx]).addClass('active');
		}
	}
}

var common = {
	on: function(event, target, func){

		if(target == document)
			$(target).on(event, func)
		else
			$(document).on(event, target, func);
	}
}

/* Events */
common.on('click', '#addFormButton input', function(){
	app.tour.open(300);
});

common.on('submit', '#addForm form', function(e){

	var name = $('#addForm #tourName').val();
	if( ! name ){
		alert('관광지명을 입력해주세요 !');
		return false;
	}

	var obj = {};
	obj.title = name;

	app.tour.appendData(obj);

	return false;
});

common.on('click', '#addForm .tourCancel', function(){
	app.tour.hide(300);
});

/* 관광지 관련 이벤트 */
common.on('click', '.tourDeleteBtn', function(){

	var idx = $(this).data('idx');
	var tour = $('.tour[data-idx="'+idx+'"]');

	app.query.delete('place', idx, function(){

		tour.addClass('remove');

		setTimeout(function(){
			tour.remove();
		}, 1000)
	})
});

/* 캔버스 파일 업로드 및 그리기 관련 */
common.on('dragover', function(e){
	e.preventDefault();
});

common.on('drop', '#image_area', function(e){
	e.preventDefault();

	if(app.canvas.file){
		// 이미 파일이 업로드 되어있으면 드래그 업로드를 차단
		return false;
	}

	var files = e.originalEvent.dataTransfer.files;
	if(files.length){
		var file = files[0];

		app.canvas.file = file;
		app.canvas.upload();
	}
});

common.on('mousedown', '.sizeSet', function(){

	var val = $(this).val();
	var target = $('.sizeInput');
	var size = target.val() * 1;
	if(val == '+'){
		size += 1;
	} else {
		size -= 1;
	}

	if(size <= 1){
		size = 1;
	}

	target.val(size);
});

common.on('click', '#image_area', function(){

	if(app.canvas.file){
		// 이미 파일이 업로드 되어있으면 파일 업로드를 차단
		return false;
	}

	$('#fileUpload').click();
});

common.on('change', '#fileUpload', function(){
	var files = this.files;

	if(app.canvas.file){
		// 이미 파일이 업로드 되어있으면 파일 업로드를 차단
		return false;
	}

	if(files.length){
		var file = files[0];

		app.canvas.file = file;
		app.canvas.upload();
	}
});

common.on('click', '.brushBtn', function(){

	if(app.canvas.brushActive){
		$(this).removeClass('active');
		app.canvas.brushActive = false;
	} else {
		$(this).addClass('active');
		app.canvas.brushActive = true;
	}
});

common.on('mousedown', '#image_area canvas', function(e){
	e.preventDefault();
	var x = e.offsetX;
	var y = e.offsetY;

	var ctx = app.canvas.ctx;

	app.canvas.drawCheck = true;
	ctx.beginPath();
	ctx.moveTo(x, y);
});

common.on('mousemove', '#image_area canvas', function(e){
	e.preventDefault();
	var x = e.offsetX;
	var y = e.offsetY;

	app.canvas.draw(x, y);
});

common.on('mouseup mouseleave', '#image_area canvas', function(e){
	e.preventDefault();
	app.canvas.drawCheck = false;
	var x = e.offsetX;
	var y = e.offsetY;

	app.canvas.ctx.closePath();
});

/* 추가된 카드 삭제 */
common.on('click', '.card .cardDelete', function(){
	var idx = $(this).data('idx');

	app.query.delete('cards', idx, function(){
		var card = $('.card[data-idx="'+idx+'"]');
		card.addClass('remove');

		setTimeout(function(){
			card.remove();
		}, 1000);
	});
});

/* 사진 이어보기 */
common.on('click', '.btn-tour-photoview', function(){

});

common.on('click', '#photoViewPos li', function(){
	var idx = $(this).index() * 1;
	app.preview.page = idx+1;
	app.preview.filter();

	app.preview.move();
});

common.on('click', '#next_btn', function(){
	app.preview.page += 1;
	app.preview.filter();

	app.preview.move();
});

common.on('click', '#prev_btn', function(){
	app.preview.page -= 1;
	app.preview.filter();

	app.preview.move();
});

/* 어플리케이션 시작 시 실행 */
$(function(){
	app.construct();
})

/**
 * [dd 콘솔로그 단축판]
 * @return {[type]} [description]
 */
function dd(){
	for(var i in arguments)
		console.log(arguments[i]);
}

/**
 * [ss jQuery Find Function]
 * @return {[type]} [description]
 */
function ss(parent, children){
	return $(parent).find(children);
}