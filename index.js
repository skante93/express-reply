
const stream = require('stream');

const isSuccessCode = (code) => code >= 200 && code < 300;
const isStream = (body) => body instanceof stream.Readable || body instanceof stream.Duplex;

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 * @param {*} next 
 */
function ReplyMiddleware (req, res, next) {

    res._reply = function(response, options = {pretty: true, log: 'error'}){
        options.pretty = typeof options.pretty === 'boolean' ? options.pretty : true;

        if (response instanceof Error) {
            res.writeHead(500, {'content-type':'application/json'});
            var reply = { 
                code: 500, 
                status: "error", 
                format: "text/plain", 
                message: response.message,
            }
            //console.log('body', body);
            if (options.log === 'error' || options.log === 'all') console.error(response);
            return res.end( options.pretty ? JSON.stringify(reply, null, 2): JSON.stringify(reply) ) 
        }

        if(isStream(response)){
            if (options.log === 'all') console.error(`[${code}]`, "+-+ [STREAM] +-+");
            return response.pipe(res);
        }

        let {statusCode, code, body, headers, format, props, noWrap} = response; 
        code = statusCode || code || (typeof body !== "undefined" && body != null && body instanceof Error ? 500 : 200);
        props = props || {};
        headers = headers || {};

        if (noWrap === true){
			res.writeHead(code, headers);

            if (isStream(body)) return body.pipe(res);
            
            return res.end(body);
		}

        if (typeof body === 'string' || body instanceof Buffer){
            // console.log("string or buffer body");
            res.writeHead(code, {...headers, 'content-type':'application/json'});
            var reply = { 
                code, 
                status: "success", 
                format: format || headers['content-type'] || (body instanceof Buffer ? "buffer" : "text/plain"), 
                response: [typeof body === 'string' ? body : Array.from(body) ],
				...props
            }
            if (options.log === 'all') console.error(`Success [${code}] [${reply.format}]`);
            res.end( options.pretty ? JSON.stringify(reply, null, 2): JSON.stringify(reply) ) 
        } 
        else if(body instanceof Error){
            // console.log("error body");
            res.writeHead(code, {...headers, 'content-type':'application/json'});
            var reply = { 
                code, 
                status: "error", 
                format: "text/plain", 
                message: body.message,
				...props
            }
            if (options.log === 'error' || options.log === 'all') console.error(`Error [${code}]`, body);
            res.end( options.pretty ? JSON.stringify(reply, null, 2): JSON.stringify(reply) ) 
        }
        else if(isStream(body)){
            // headers['content-type'] = headers['content-type'] || 'application/octet-stream';
            // res.writeHead(code, headers);
            if (options.log === 'all') console.error(`[${code}]`, "+-+ [STREAM] +-+");
            body.pipe(res);
        }
		else if (body == null || isNaN(body)){
            // Object.entries(headers).length && res.writeHead(code, headers);
            (options.log === 'all') && console.error(`[${code}] [EMPTY BODY]`);
            res.writeHead(code, headers);
            var reply = { 
                code, 
                status: isSuccessCode(code) ? "success" : "error", 
                format: "none" , 
                ...props
            }
            res.end( options.pretty ? JSON.stringify(reply, null, 2): JSON.stringify(reply) ) 
        }
        else {
            // JSON object
            //
            res.writeHead(code, {...headers, 'content-type':'application/json'});
            var reply = { 
                code, 
                status: "success", 
                format: format || headers['content-type'] || "application/json", 
                response: body ,
				...props
            }
            if (options.log === 'all') console.error(`Success [${code}] [${reply.format}]`);
            res.end( options.pretty ? JSON.stringify(reply, null, 2): JSON.stringify(reply) ) 
        }
    }
    next();
}

module.exports = ReplyMiddleware