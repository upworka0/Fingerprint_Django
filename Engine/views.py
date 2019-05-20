from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import *

import os
os.environ['CLASSPATH'] = "/opt/Crossmatch/urusdk-linux/Linux/lib/java/dpuareu.jar"
from PIL import Image
import glob
import numpy as np
from jnius import autoclass
import base64
import datetime

#define java library for using it in python
Fmd = autoclass('com.digitalpersona.uareu.Fmd')
Format = autoclass('com.digitalpersona.uareu.Fmd$Format')
UareUGlobal = autoclass('com.digitalpersona.uareu.UareUGlobal')
UareUException = autoclass('com.digitalpersona.uareu.UareUException')
UareUEngine = autoclass('com.digitalpersona.uareu.Engine')
EngineCandidate = autoclass('com.digitalpersona.uareu.Engine$Candidate')
List = autoclass('java.util.List')
Arrays = autoclass('java.util.Arrays')
ArrayList = autoclass('java.util.ArrayList')
JavaArray = autoclass('java.lang.reflect.Array')
Object = autoclass('java.lang.Object')
global_engine = UareUGlobal.GetEngine()
falsepositive_rate = UareUEngine.PROBABILITY_ONE / 100000

# Engine for identifying the fingerprint
def identify_engine(filepath):
    inputimg = Image.open(filepath)
    byte_data = inputimg.tobytes()
    wid, hei = inputimg.size
    # get Fmd for input data
    inputfmd = global_engine.CreateFmd(
        byte_data,
        wid,
        hei,
        500, 0, 3407615, Format.ISO_19794_2_2005)

    name_list = []
    fmd_list = ArrayList()
    for filename in glob.glob("static/images/*.png"):
        im = Image.open(filename)
        byte_im = im.tobytes()
        width, height = im.size
        # get the fmd data for db datas
        data = global_engine.CreateFmd(
            byte_im,
            width,
            height,
            500, 0, 3407615, Format.ISO_19794_2_2005)

        img_name = os.path.basename(filename)
        name_list.append(img_name)
        fmd_list.add(data)

    result_str = ""
    if fmd_list.size() > 0:
        name_array = np.asarray(name_list)
        fmd_array = JavaArray.newInstance(Fmd, fmd_list.size())
        fmd_array = fmd_list.toArray(fmd_array)

        vCandidates = global_engine.Identify(inputfmd, 0, fmd_array, falsepositive_rate, len(fmd_list));
        if 0 != len(vCandidates):
            falsematch_rate = global_engine.Compare(inputfmd, 0, fmd_array[vCandidates[0].fmd_index],
                                                    vCandidates[0].view_index)

            identify_result = name_array[vCandidates[0].fmd_index]
            # score_result = falsematch_rate
            # match_result = (float)(falsematch_rate / UareUEngine.PROBABILITY_ONE)
            # res_str = identify_result + '\n' + str(score_result) + '\n' + str(match_result)
            # print(res_str)
            result_str = os.path.splitext(identify_result)[0]

        else:
            result_str = ""

    time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    json_res = {}
    json_res.update({"Name": result_str,
                     "Time": time})

    return json_res

# Create your views here.
def index(request):
    return render(request, "index.html")

def getImagePath(base64_str):
    imgdata = base64.b64decode(base64_str)
    filePath = "static/tmp/" + "tmp_img" + datetime.datetime.now().strftime("%M%S") + ".png"
    with open(filePath, 'wb') as f:
        f.write(imgdata)
    return filePath

def saveImagePath(base64_str, imgname):
    imgdata = base64.b64decode(base64_str)
    filePath = "static/images/" + imgname + ".png"
    flag = 'true'
    try:
        with open(filePath, 'wb') as f:
            f.write(imgdata)
    except IOError as e:
        return ''
    return filePath

@csrf_exempt
def process(request):
    if request.method == "POST":
        input_base64 = request.POST['data']
        filePath = getImagePath(input_base64)
        result = identify_engine(filePath)
        return JsonResponse(result)

@csrf_exempt
def register(request):
    if request.method == "POST":
        input_base64 = request.POST['data']
        username = request.POST['username']
        img_path = saveImagePath(input_base64, username)
        if img_path == '':
            return JsonResponse({"status" : 'failed', "message" : "Image is not saved!"})

        user = PrintUser.objects.filter(username=username)        
        if user.count() > 0:
            return JsonResponse({"status" : 'failed', "message" : "Email is already registered!"})

        new_user = PrintUser()
        new_user.username = username
        new_user.image_path = img_path
        new_user.save()
        return JsonResponse({"status" : 'success', "message" : "Data is registered successfully!"})