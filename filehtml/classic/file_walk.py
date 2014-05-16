__author__ = 'huiswang'

import os
fileList = []
rootdir = "E:\workaround\svncode\WANController\server"
for root, subFolders, files in os.walk(rootdir):
    if '.svn' in subFolders: subFolders.remove('.svn')
for file in files:
    if file.find(".py") != -1:
        file_dir_path = os.path.join(root,file)
        fileList.append(file_dir_path)

print fileList
