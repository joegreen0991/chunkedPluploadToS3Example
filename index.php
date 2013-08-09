<?php 
// Include the s3 bucket setttings
include 'config.php';
?>

<!doctype html>
<html>
	<head>
		<meta content-type="UTF-8"/>
		<title>Plupload to Amazon S3 Example</title>
	</head>
	
	<body style="font:13px Verdana;color:#333">

		<h1>Plupload to Amazon S3 Example</h1>

		<div id="mainupload-cont">
			
			<button id="mainupload">Upload</button>
			
		</div>
		
		<div style="border:1px solid #CCC; padding:10px;" id="log"></div>

		<!-- 
			production requires a forked version of plupload to allow BeforeChunkUpload method and PUT requests https://github.com/joegreen0991/plupload
			All compiled srcs are in https://github.com/joegreen0991/plupload/tree/master/js
		-->
		<script type="text/javascript" src="plupload/js/plupload.full.min.js"></script>
		
		<script type="text/javascript">
			
			// Just a Promise based cross browser XHR request implementation - implement with jQuery if you like with $.post() etc
			var Promise=function(){var e=function(){return new function(){var e=null,t=[],n=[],r=function(r){for(n=r||n;t.length;)t.shift()[!1===e?1:0].apply(this,n)},i=function(){};this.then=function(n,s){t.push([n||i,s||i]);null!==e&&r();return this};this.always=function(e){return this.then(e,e)};this.done=function(e){return this.then(e)};this.fail=function(e){return this.then(null,e)};this.isResolved=function(){return!0===e};this.isRejected=function(){return!1===e};this.isPending=function(){return null===e};this.resolve=function(){e=!0;r(arguments);return this};this.reject=function(){e=!1;r(arguments);return this}}};e.when=function(t){for(var n=e(),r=0,i=!1,s=0,o=t.length;s<o;s++)t[s].then(function(){t.length===++r&&n.resolve()},function(){i=i||n.reject.apply(n,arguments)||!0});return 0===t.length?n.resolve():n};return e}()
			var Xhr=function(){var e=function(e){for(e=0;e<4;e++)try{return e?new ActiveXObject([,"Msxml2","Msxml3","Microsoft"][e]+".XMLHTTP"):new XMLHttpRequest}catch(t){}},t=function(e){if(typeof e==="string"){return e}var t=encodeURIComponent,n="";for(var r in e){n+="&"+t(r)+"="+t(e[r])}return n.substr(1)},n=function(n,r,i,s,o){var u=Promise(),a=e(),f=t(i||{});if(n==="GET"&&f){r+="?"+f;f=null}a.open(n,r,true);a.setRequestHeader("Content-type","application/x-www-form-urlencoded");for(var l in s||{}){a.setRequestHeader(l,s[l])}a.onreadystatechange=function(){if(a.readyState===4){(a.status===200?u.resolve:u.reject)({data:JSON.parse(a.responseText),status:a.status,headers:a.getResponseHeader})}};a.send(f);u.abort=a.abort;return u};return{get:function(e,t,r){return n("GET",e,t,r)},post:function(e,t,r){return n("POST",e,t,r)},put:function(e,t,r){return n("PUT",e,t,r)},"delete":function(e,t,r){return n("DELETE",e,t,r)},spoof:function(e,t,n){return Promise().resolve({data:e,headers:function(e){return t?t.header:null},status:n||200})}}}()
		
			// Logging to a div
			var logElement = document.getElementById('log');
			function log(message){
				logElement.innerHTML = message + '<br>' +logElement.innerHTML;
			}


			
			// These are the two functions we need to sign each chunk upload, and then complete the upload when all chunks have been sent.
			var AmazonAPI = {
				
				// File param is just the plupload file object
				signPart: function(file) {

					return Xhr.post('server.php?action=sign', file).then(function(response){
						
						// Store the returned upload id on the file model - It will get resent each time
						file.uploadId = response.data.uploadId;
					});
				},
						
				completeMultipart: function(file) {
			
					return Xhr.post('server.php?action=complete', file);
				}
				
			};
			
			new plupload.Uploader({
				
				browse_button: 'mainupload',
				drop_element: 'mainupload-cont',
				container: 'mainupload-cont',
				
				// Cannot use flash env because it doesn't support PUT requests and amazon need a PUT for multipart - shame they don't support the overide_method header - then we could use POST with flash
				// HTML5 environment is supported by >= IE 9 and if IE 8 users MUST be allowed to use the system then they won't mind installing silverlight.
				// Otherwise we could direct them to an ond school form based upload page
				runtimes: 'html5,silverlight',
				
				// The s3 bucket endpoint
				url: 'http://<?=S3_BUCKET?>.s3.amazonaws.com/',
				
				// This is largest object you can store in S3
				//max_file_size: '5tb',
				
				// Otherwise we send a multipart content-type with random boundary string that will ruin our signature and Amazon will reject the request - this forces "application/octet-stream"
				multipart: false, 

				// Optional, but better be specified directly
				file_data_name: 'file',
				
				// Amazons S3 API required that we "PUT" the data for multipart uploads
				method: 'put',
				
				// Silverlight settings
				silverlight_xap_url: 'plupload/js/Moxie.xap',
				
				// Make sure we rety chunks in the event of chunk failure - Amazon S3 has been known to drop connections
				max_retries : 5,
				
				// The minimum chunk size S3 will accept is 5mb - you can go larger - this will minimize the signing requests but will waste more data in the event of a chunk failure
				chunk_size: '20mb',
				
				init: {
					
					FilesAdded: function(up, files) {
						
						log('Uploading');
						
						up.start(); // Automatically start uploading when files are added
					},

					// THIS IS THE IMPORTANT ONE -  WE SIGN EACH CHUNK REQUEST SERVER SIDE AND RETURN THE SIGNED 
					BeforeUploadChunk: function(up, file) {
						
						log('Signing');
						
						// We need to set the current chunk as a file property to be sent as a param in the request - we have to calculate the current chunk number using Maths
						file.chunk = file.loaded / up.settings.chunk_size;

						AmazonAPI.signPart(file).then(function(response) {

							// We get back our signed amazon URL ready to upload to - set this for the uploader
							up.settings.url = response.data.url;
							
							// And away we go
							up.trigger("UploadChunk");
						});

						return false; // Must return false to pause the chunk upload while we asychronously fetch the signed url
					},
						
					
					UploadProgress: function(up, file) {
				
						// Implement your own visual feedback here - this is just so you can see it working
						log(file.percent);
					},
							
					FileUploaded: function(up, file) {

						log('Completing');
						
						// THIS IS IMPORTANT! we must finalise the upload once all parts have been sent
						AmazonAPI.completeMultipart(file).then(function(response){
							
							// Response could send back the loaded file meta, for reinsertion into the model view or whatever
							log('Complete - Your file is now in the specified S3 Bucket');
							
						});
						
					}
				}
			}).init();

		</script>

	</body>
</html>