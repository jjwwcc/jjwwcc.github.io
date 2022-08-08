
var form = document.getElementById('form');

// Add event listener to form
form.addEventListener('submit', function (e) {
    // Stop the form from submitting
    e.preventDefault();

    // Get the file from the input
    var file = document.getElementsByName('file')[0].files[0];
    var fileName = file.name;

    // Create a new formdata object
    var formData = new FormData();
    formData.append('file', file);

    // Create a new XHR
    var xhr = new XMLHttpRequest();

    document.getElementById('progress').style.display = 'block';

    // update the progress bar
    xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) {
            var percentComplete = (e.loaded / e.total) * 100;
            // 保留到小数点后面两位
            percentComplete = percentComplete.toFixed(2);
            document.getElementById('progress').value = percentComplete;
            document.getElementById('percent').innerHTML = percentComplete + '%';
        }
    }

    xhr.open('POST', 'https://wgectnsmzmxcjiqjnhmz.supabase.co/storage/v1/object/winner/public/' + fileName, true);
    xhr.setRequestHeader('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZWN0bnNtem14Y2ppcWpuaG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTI0MDI0MTQsImV4cCI6MTk2Nzk3ODQxNH0.-a4ScC1q-eT-NxX0dkm0eWOiRvoVSewQ1bULtqEWqkc');
    xhr.send(formData);
    // hide the form
    document.getElementById('form').style.display = 'none';

    // Add an event listener to the XHR
    xhr.addEventListener('readystatechange', function (e) {

        if (xhr.readyState == 4 && xhr.status == 200) {
            // Get the response
            var response = JSON.parse(xhr.responseText);
            // Get the URL of the uploaded file
            fileKey = response.Key
            console.log(response);
            var url = 'https://wgectnsmzmxcjiqjnhmz.supabase.co/storage/v1/object/public/' + fileKey;
            // Show the uploaded file
            document.getElementById('filelist').style.display = 'block';
            document.getElementById('list-files').innerHTML = '<a href="' + url + '" target="_blank" id="link">' + url + '</a>';
            // hide the progress bar
            document.getElementById('form').style.display = 'none';
            // hide the progress bar
            document.getElementById('progress').style.display = 'none';
            // hide the percent
            document.getElementById('percent').innerHTML = '<h4>Uploaded!</h4>';
            new QRCode(document.getElementById("qrcode"), url);

        }

        if (xhr.readyState == 4 && xhr.status == 400) {
            // Get the response
            var response = JSON.parse(xhr.responseText);
            // show the error
            document.getElementById('error').style.display = 'block';
            if (response.statusCode == '23505') {
                document.getElementById('error-msg').innerHTML = '<h4> File already exists </h4>';
                // show back button            
            }
        }
    });
}
);

//  copy the link button
$('#copy-link').click(function () {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($('#link').text()).select();
    document.execCommand("copy");
    $temp.remove();
});

//  back to form button
$('#back-form').click(function () {
    $('#filelist').hide();
    $('#percent').text('');
    $('#form').show();
    $('#file').val('');
    // clear qrcode
    $('#qrcode').html('');
});

$('#error-back').click(function () {
    $('#error').hide();
    $('#process').hide();
    $('#percent').text('');
    $('#form').show();
    $('#file').val('');
});
