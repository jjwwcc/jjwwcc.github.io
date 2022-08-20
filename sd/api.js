var listUrl = 'http://fwstart.com:4567/api/list/21/';
var wordUrl = 'http://fwstart.com:4567/api/id/'
var searchUrl = 'http://fwstart.com:4567/api/word/';

function fetchList(i) {

    const result = fetch(listUrl + i, { method: 'get' })
        .then(response => response.json()) // pass the data as promise to next then block
        .then(data => {
            // var listHtml= '<li class="list-group-item border-0 p-3">Last</li>';
            var listHtml = ' ';
            for (let i = 0; i < data.length; i++) {
                listHtml += '<li class="list-group-item border-0 p-3"><a href="#" onClick="getWord(' + data[i].id + ')">' + data[i].word + '</a></li>';
            }
            // listHtml += '<li class="list-group-item border-0 p-3">Next</li>';
            document.getElementById('list').innerHTML = listHtml;
            // change str to int
            i = Number(i)
            document.getElementById('prev').value = i - 1;
            document.getElementById('next').value = i + 1;
            const id = data[0].id;
            const word = data[0].word;
            return fetch(`${wordUrl}${id}`); // make a 2nd request and return a promise
        })
        .then(response => response.json())
        .catch(err => {
            console.error('Request failed', err)
        })

    // I'm using the result const to show that you can continue to extend the chain from the returned promise
    result.then(r => {
        var dic = r[0].dic;
        var title = '<h2>' + r[0].word + '</h2>';
        var details = '';
        var image = '<img src=' + r[0].img + ' width="100%">';
        var created_at = r[0].created_at;
            created_at = created_at.split('T');
        for (let i = 0; i < dic.length; i++) {
            var num = i + 1;
            details += '<p><b>' + num + '/' + dic.length + '. </b> (' + dic[i].type + ')  ' + dic[i].definition + '</p>' + '<h3>' + dic[i].example + '</h3><hr>';
        }
        document.getElementById('title').innerHTML = title;
        document.getElementById('details').innerHTML = details;
        document.getElementById('image').innerHTML = image;
        document.getElementById('created_at').innerHTML = created_at[0];
        document.getElementById('source').innerHTML = r[0].note.source;
        document.getElementById('level').innerHTML = '21';
    });
}

function getWord(id) {
    fetch(`${wordUrl}${id}`).then(response => response.json())
        .then(data => {
            var dic = data[0].dic;
            var title = '<h3>' + data[0].word + '</h3>';
            var details = '';
            var image = '<img src=' + data[0].img + ' width="600px">';
            var created_at = data[0].created_at;
            created_at = created_at.split('T');
            for (let i = 0; i < dic.length; i++) {
                var num = i + 1;
                details += '<p><b>' + num + '/' + dic.length + '. </b> (' + dic[i].type + ')  ' + dic[i].definition + '</p>' + '<h3>' + dic[i].example + '</h3><hr>';
            }
            document.getElementById('title').innerHTML = title;
            document.getElementById('details').innerHTML = details;
            document.getElementById('image').innerHTML = image;
            document.getElementById('created_at').innerHTML = created_at[0];
            document.getElementById('source').innerHTML = data[0].note.source;
            document.getElementById('level').innerHTML = '21';
        }).catch(err => {
            console.error('Request failed', err)
        })

}

$(document).on('click', '#prev', function () {
    var i = $(this).val();
    fetchList(i);
}).on('click', '#next', function () {
    var i = $(this).val();
    fetchList(i);
}).on('click', '#search', function () {
    var word = $('#search-word').val();
    fetch(`${searchUrl}${word}`).then(response => response.json())
        .then(data => {
            var dic = data[0].dic;
            var title = '<h3>' + data[0].word + '</h3>';
            var details = '';
            var image = '<img src=' + data[0].img + ' width="600px">';
            var created_at = data[0].created_at;
            created_at = created_at.split('T');
            console.log(dic.length);
            if (data[0].note == null) {
                var source = 'No source';
            } else if (data[0].note.source == null) {
                var source = 'No source';
            } else {
                var source = data[0].note.source;
            }
            for (let i = 0; i < dic.length; i++) {
                var num = i + 1;
                details += '<p><b>' + num + '/' + dic.length + '. </b> (' + dic[i].type + ')  ' + dic[i].definition + '</p>' + '<h3>' + dic[i].example + '</h3><hr>';
            }
            document.getElementById('title').innerHTML = title;
            document.getElementById('details').innerHTML = details;
            document.getElementById('image').innerHTML = image;
            document.getElementById('created_at').innerHTML = created_at[0];
            document.getElementById('source').innerHTML = source;
            document.getElementById('level').innerHTML = '21';
        }).catch(err => {
            console.error('Request failed', err)
        }).then(() => {
            $('#search-word').val('');
        }).catch(err => {
            console.error('Request failed', err)
        }).then(() => {
            $('#search-word').focus();
        }).catch(err => {
            console.error('Request failed', err)
        }).then(() => {
            $('#search-word').select();
        }).catch(err => {
            console.error('Request failed', err)
        })
})

fetchList(1);
