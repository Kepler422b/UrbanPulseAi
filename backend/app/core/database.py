import logging
from typing import Optional
from pymongo import MongoClient
from pymongo.collection import Collection
import mongomock
from app.core.config import settings

logger = logging.getLogger(__name__)

class DatabaseManager:
    _client: Optional[MongoClient] = None
    _db = None
    _is_mock: bool = False

    @classmethod
    def get_client(cls):
        if cls._client is None:
            cls.connect()
        return cls._client

    @classmethod
    def connect(cls):
        uri = settings.MONGODB_URI
        if uri and uri.strip():
            try:
                logger.info("Attempting connection to MongoDB at configured URI...")
                client = MongoClient(uri, serverSelectionTimeoutMS=2500)
                # Verify connection
                client.admin.command('ping')
                cls._client = client
                cls._db = client[settings.MONGODB_DB_NAME]
                cls._is_mock = False
                logger.info(f"Connected successfully to live MongoDB: {settings.MONGODB_DB_NAME}")
                cls.init_indexes()
                return
            except Exception as e:
                logger.warning(f"Could not connect to live MongoDB ({e}). Falling back to in-memory mongomock engine for demo evaluation.")
        
        # Fallback to mongomock
        logger.info("Using embedded mongomock engine for standalone academic prototype evaluation.")
        cls._client = mongomock.MongoClient()
        cls._db = cls._client[settings.MONGODB_DB_NAME]
        cls._is_mock = True
        cls.init_indexes()

    @classmethod
    def get_db(cls):
        if cls._db is None:
            cls.connect()
        return cls._db

    @classmethod
    def is_mock(cls) -> bool:
        return cls._is_mock

    @classmethod
    def init_indexes(cls):
        try:
            db = cls._db
            # Create indexes on reports
            db.reports.create_index("public_report_id", unique=True)
            db.reports.create_index("category")
            db.reports.create_index("status")
            db.reports.create_index("locality")
            db.reports.create_index("created_at")
            db.reports.create_index("user_id")
            
            # Users
            db.users.create_index("email", unique=True)
            
            # Status history & notes
            db.status_history.create_index("report_id")
            db.internal_notes.create_index("report_id")
            db.insights.create_index("generated_at")
        except Exception as e:
            logger.warning(f"Index creation notice: {e}")

    @classmethod
    def get_collection(cls, name: str) -> Collection:
        return cls.get_db()[name]

def get_database():
    return DatabaseManager.get_db()
