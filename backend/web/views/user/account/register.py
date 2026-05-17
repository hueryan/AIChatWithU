from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from web.models.user import UserProfile


class RegisterView(APIView):
    def post(self, request):
        try:
            username = request.data['username'].strip()
            password = request.data['password'].strip()
            if not username or not password:
                return Response({
                    'result': '用户名或密码不能为空',
                })

            if User.objects.filter(username=username).exists():
                return Response({
                    'result': '用户名已存在'
                })

            user = User.objects.create_user(username=username, password=password)
            user_profile = UserProfile.objects.create(user=user)
            refresh = RefreshToken.for_user(user)

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
                max_age=86400 * 7,  # refresh 7 天有效
            )

            return response

        except:
            # import traceback
            # print(traceback.format_exc())  # 在终端打印信息
            return Response({
                'result': '系统异常，请稍后重试'
            })