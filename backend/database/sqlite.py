from sqlalchemy import UUID, create_engine, and_, asc, desc
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError, NoResultFound
from contextlib import contextmanager
import os
import traceback
from fastapi.encoders import jsonable_encoder
from typing import Optional, TypeVar, Any, Dict, List, Union
from .tables import BASE

ORM_CLASS = TypeVar('ORM_CLASS')
ORM_INSTANCE = TypeVar('ORM_INSTANCE')

class SqliteManager:
    def __init__(self, db_name: str, storage_path: str='.'):
        self.base = BASE
        self.db_name = db_name
        try:
            if not os.path.exists(storage_path):
                os.makedirs(storage_path)
            connection_string = f"sqlite:///{storage_path}/{self.db_name}.db"
            self.engine = create_engine(
                connection_string, 
                echo=False,
                connect_args={"check_same_thread": False},
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20
            )
            self.Session = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        except Exception as e:
            print(f"Failed to create engine or sessionmaker: {e}")
            traceback.print_exc()
            raise e

        try:
            self._init_tables()
        except Exception as e:
            print(f"Failed to create tables: {e}")
            traceback.print_exc()
            raise e

    
    def _init_tables(self):
        self.base.metadata.create_all(bind=self.engine)
    
    def as_dict(self, obj: ORM_INSTANCE) -> Dict[str, Any]:
        return {column.name: getattr(obj, column.name) for column in obj.__table__.columns}
    
    def insert(
            self,
            orm_class: ORM_CLASS, 
            data: Dict[str, Any],
        ) -> ORM_INSTANCE:
        with self.Session() as session:
            new_record = orm_class(**data)
            try:
                session.add(new_record)
                session.commit()
            except IntegrityError as e:
                traceback.print_exc()
                session.rollback()
                raise IntegrityError(f"Integrity error occurred while inserting record into {orm_class.__name__}", e.params, e.orig)
            except Exception as e:
                traceback.print_exc()
                session.rollback()
                raise SQLAlchemyError(f"An error occurred while inserting record into {orm_class.__name__}: {str(e)}")
            else:
                session.refresh(new_record)
            return self.as_dict(new_record)

    def insert_many(
            self,
            orm_class: ORM_CLASS, 
            data_list: List[Dict[str, Any]],
        ) -> List[ORM_INSTANCE]:
        with self.Session() as session:
            records = [orm_class(**data) for data in data_list]
            try:
                session.add_all(records)
                session.commit()
            except IntegrityError as e:
                traceback.print_exc()
                session.rollback()
                raise IntegrityError(f"Integrity error occurred while inserting multiple records into {orm_class.__name__}", e.params, e.orig)
            except Exception as e:
                traceback.print_exc()
                session.rollback()
                raise SQLAlchemyError(f"An error occurred while inserting multiple records into {orm_class.__name__}: {str(e)}")
            else:
                for record in records:
                    session.refresh(record)
            return [self.as_dict(record) for record in records]
    
    def select(
            self,
            orm_class: ORM_CLASS, 
            conditions: Dict[str, Any] = {}, 
            order_by: List[str] = None, 
            limit: int = None, 
            offset: int = None
        ) -> List[ORM_INSTANCE]:
        with self.Session() as session:
            try:
                query = session.query(orm_class)
                if conditions:
                    filter_conditions = [getattr(orm_class, key) == value for key, value in conditions.items()]
                    query = query.filter(and_(*filter_conditions))
                if order_by:
                    order_by_clauses = []
                    for ob in order_by:
                        if ob.startswith('-'):
                            order_by_clauses.append(desc(getattr(orm_class, ob[1:])))
                        else:
                            order_by_clauses.append(asc(getattr(orm_class, ob)))
                    query = query.order_by(*order_by_clauses)
                if limit:
                    query = query.limit(limit)
                if offset is not None:  
                    query = query.offset(offset)
                records = query.all()
            except Exception as e:
                traceback.print_exc()
                raise SQLAlchemyError(f"An error occurred while selecting records from {orm_class.__name__}: {str(e)}")
            return [self.as_dict(record) for record in records]    
    
    def delete(
            self,
            orm_class: ORM_CLASS, 
            conditions: Dict[str, Any]
        ) -> bool:
        with self.Session() as session:
            try:
                query = session.query(orm_class)
                if conditions:
                    filter_conditions = [getattr(orm_class, key) == value for key, value in conditions.items()]
                    query = query.filter(and_(*filter_conditions))
                records = query.all()
                if not records:
                    return False
                for record in records:
                    session.delete(record)
                session.commit()
            except Exception as e:
                traceback.print_exc()
                session.rollback()
                raise SQLAlchemyError(f"An error occurred while deleting records in {orm_class.__name__}: {str(e)}")
            return True