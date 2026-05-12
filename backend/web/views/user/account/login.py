from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from web.models.user import UserProfile


class LoginView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            username = request.data['username'].strip()  # 两种方式都可以获取字典
            password = request.data.get("password").strip()

            if not username or not password:
                return Response({
                    'result': '用户名或密码不能为空'
                })
            user = authenticate(username=username, password=password)  # 验证用户名和密码是否匹配

            if user:  # 用户名密码正确
                user_profile = UserProfile.objects.get(username=username)  # UserProfile 之前定义的数据表
                '''
                    refresh: 刷新令牌
                    refresh.access_token: 令牌
                '''
                refresh = RefreshToken.for_user(user)  # 生成 jwt
                response = Response({
                    'result': 'success',
                    'access': str(refresh.access_token),
                    # 'refresh': str(refresh),  # 前端保存 refresh，用于静默刷新
                    'user_id': user.id,
                    'username': user.username,
                    'photo': user_profile.photo.url,  # 加 url 才返回路径
                    'profile': user_profile.profile,
                })

                # 设置 cookie，将refresh放入cookie
                response.set_cookie(
                    key='refresh_token',
                    value=str(refresh),
                    httponly=True,
                    samesite='Lax',
                    secure=True,
                    max_age= 86400 * 7,  # refresh 7 天有效
                )
                return response
            return Response({
                'result': '用户名或密码错误',
            })
        except:
            return Response({
                'result': '系统异常，请稍后重试'
            })