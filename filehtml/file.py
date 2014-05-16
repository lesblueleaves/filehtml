import os

import tornado.ioloop
import tornado.web
import tornado.httpclient
import urllib2
import urllib
import httplib
from httplib2 import Http

import json
import httplib

class FileHandler(tornado.web.RequestHandler):


    def get(self,folder_name):
        print "folder_name: "+folder_name

        result = []
        if ''== folder_name:

            # item={"name":"123","ext":"","folder":"1","contenttype":"","size":"1999","lastmodified":"2013-07-09 23:10:11"}
            # item1={"name":"1231","ext":"","folder":"1","contenttype":"","size":"2048","lastmodified":"2013-07-19 23:10:11"}
            # item2={"name":"1q.txt","ext":"","folder":"2","contenttype":"","size":"7777","lastmodified":"2013-07-29 23:10:11"}
            item = {"name":"IMG_0001 1.JPG","modifyDate":"2012-12-03 09:05:31 +0000","folder":"false","size":1399461}
            item1 = {"name":"btest","modifyDate":"2013-09-12 03:35:56 +0000","folder":"true","size":15}
            item2 = {"name":"iPhone_Advanced_Projects.pdf","modifyDate":"2013-05-17 04:30:10 +0000","folder":"false","size":6200491}
            result.append(item)
            result.append(item1)
            result.append(item2)
        # elif '123' == folder_name:
        #     item={"name":"223","ext":"","folder":"1","contenttype":"","size":"1999","lastmodified":"2013-07-09 23:10:11"}
        #     item1={"name":"2231","ext":"","folder":"1","contenttype":"","size":"2048","lastmodified":"2013-07-19 23:10:11"}
        #     item2={"name":"21q.txt","ext":"","folder":"2","contenttype":"","size":"7777","lastmodified":"2013-07-29 23:10:11"}
        #     item3={"name":"221q.txt","ext":"","folder":"2","contenttype":"","size":"7777","lastmodified":"2013-07-29 23:10:11"}
        #     result.append(item)
        #     result.append(item1)
        #     result.append(item2)
        #     result.append(item3)


        print(json.dumps(result))
        self.write(json.dumps(result))

    def post(self,data):

        print 'post data:', data
        print 'post got:', self.request.body
        item={"name":data,"ext":"","folder":"1","contenttype":"","size":"1234","lastmodified":"2013-07-11 23:10:11"}
        self.write(json.dumps(item))

class FolderHandler(tornado.web.RequestHandler):

    host_url = "http://10.140.41.182:50000/d3a/"

    def get(self,folder):
        print 'get folder_name:'+ folder
        # url = "http://10.140.42.3:50000"
        url = self.host_url
        if(folder != ''):
            url += "/"+folder

        reply = urllib2.urlopen(url).read()
        print(json.dumps(reply))
        self.write(reply)

    def post(self,data):

        print 'post data:', data
        print 'post got:', self.request.body
        # item={"name":data,"ext":"","folder":"1","contenttype":"","size":"1234","lastmodified":"2013-07-11 23:10:11"}
        # query_args = {"act":"mkdir"}
        # encode_data = urllib.urlencode(query_args)

        # url = "http://10.140.42.3:50000/"+data
        url = self.host_url +"/"+data

        req = urllib2.Request(url, self.request.body)
        response = urllib2.urlopen(req)
        the_page = response.read()
        # data.split('')
        return self.write(json.dumps("success"))

    def delete(self,data):
        print 'delete data:', data
        print 'delete got:', self.request.body

        conn = httplib.HTTPConnection("10.140.41.182:50000")
        del_url = '/'+ data
        conn.request('DELETE', del_url, '')
        resp = conn.getresponse()
        content = resp.read()
        return self.write(json.dumps("success"))


    # def fetch_url(url, params, method):
    #     params = urllib.urlencode(params)
    #     if method=="GET":
    #         f = urllib.urlopen(url+"?"+params)
    #     else:
    #         # Usually a POST
    #         f = urllib.urlopen(url, params)
    #     return (f.read(), f.code)


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('fileinone.html')
