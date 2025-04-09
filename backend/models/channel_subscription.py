from services.db_service import db
from datetime import datetime

class ChannelSubscription(db.Model):
    """
    チャンネル登録モデル
    
    ユーザーがYouTubeチャンネルに登録した情報を保存します。
    """
    __tablename__ = 'channel_subscriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(128), nullable=False, index=True)
    channel_id = db.Column(db.String(128), nullable=False)
    channel_title = db.Column(db.String(255), nullable=False)
    channel_thumbnail = db.Column(db.String(512), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # ユーザーとチャンネルの組み合わせでユニーク制約
    __table_args__ = (
        db.UniqueConstraint('user_id', 'channel_id', name='uq_user_channel'),
    )
    
    def __repr__(self):
        return f'<ChannelSubscription {self.user_id} - {self.channel_title}>'
    
    def to_dict(self):
        """
        モデルを辞書に変換
        """
        return {
            'id': self.id,
            'user_id': self.user_id,
            'channel_id': self.channel_id,
            'channel_title': self.channel_title,
            'channel_thumbnail': self.channel_thumbnail,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
