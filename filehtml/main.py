import tornado.ioloop
import tornado.web
import tornado.httpclient
import file
import os

settings = dict(
    template_path =  os.path.join(os.path.dirname(__file__), "templates"),
    static_path = os.path.join(os.path.dirname(__file__), "static"),
)

application = tornado.web.Application(
     [
        # (r"/", tornado.web.RedirectHandler, {"url": "/index.html"}),

        (r"/", file.MainHandler),
        (r"/d3a/([_/A-z0-9_\/]*)/?", file.FolderHandler),

        # (r"/myfile/?([_/A-z0-9_\/]*)/?", file.FileHandler),
        # (r"/folder/?([_/A-z0-9_\/]*)/?", file.FolderHandler),
        # (r"/([_/A-z0-9_\/]*)/?", file.FolderHandler),
        # (r"/myfile/?(?P<folder_name>[\w+]*)/?", file.FileHandler),

        ],**settings)



if __name__ == '__main__':
    application.listen(8007)
    tornado.ioloop.IOLoop.instance().start()