from django import forms

from .models import Attachment

class AttachmentForm(forms.ModelForm):
    class Meta:
        model = Attachment
        fields = ('file', )

class CreateProject(forms.Form):
    project_name = forms.CharField(
        label='Project Name',
        max_length=50,
        required=False,
        widget=forms.TextInput(
            attrs=
            {
                "placeholder": 'Project Name',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )
    project_code = forms.CharField(
        max_length=50,
        required=False,
        #disabled=True,
        widget=forms.TextInput(
            attrs={
                "placeholder": "Project Code",
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control',
                'pattern': '[0-9a-zA-Z]'
            }
        )
    )

    start_date = forms.DateField(
        required=False,
        widget=forms.DateInput(
            attrs={
                "placeholder": "Start Date",
                'type': 'date',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )

    end_date = forms.DateField(
        required=False,
        widget=forms.DateInput(
            attrs={
                'placeholder': "End Date",
                'type': 'date',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )

    # workflow_options = [
    #     ('CG Series', 'CG Series'),
    #     ('Demo', 'Demo'),
    #     ('DEMO123', 'DEMO123')
    # ]
    # workflow_schema = forms.ChoiceField(
    #     choices=workflow_options
    # )
    workflow_schema = forms.CharField(
        disabled=True,
        widget=forms.TextInput(
            attrs={
                'value': 'CG Series',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )

    status = forms.CharField(
        required=False,
        max_length=50,
        widget=forms.TextInput(
            attrs={
                'placeholder': 'Status',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )

    scope = forms.CharField(
        required=False,
        max_length=50,
        widget=forms.TextInput(
            attrs={
                'placeholder': 'Scope',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )

    disk = forms.CharField(
        required=False,
        max_length=150,
        widget=forms.TextInput(
            attrs={
                "placeholder": "location on disk",
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )

    entity_name = forms.CharField(
        required=False,
        max_length=50,
        widget=forms.TextInput(
            attrs={
                'placeholder': "Entity Name",
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )

    resolution = forms.CharField(
        required=False,
        max_length=50,
        widget=forms.TextInput(
            attrs={
                'placeholder': "Resolution(2048X858)",
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )

    start_frame = forms.CharField(
        required=False,
        max_length=50,
        widget=forms.TextInput(
            attrs={
                'placeholder': 'Start Frame',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )

    fps = forms.CharField(
        required=False,
        max_length=50,
        widget=forms.TextInput(
            attrs={
                'placeholder': 'fps ex:-24',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )

    version = forms.CharField(
        required=False,
        max_length=50,
        widget=forms.TextInput(
            attrs={
                'placeholder': 'Version',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )

    client_label = forms.CharField(
        required=False,
        max_length=50,
        widget=forms.TextInput(
            attrs={
                'placeholder': 'Client label',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )

    project_folder = forms.CharField(
        required=False,
        max_length=150,
        widget=forms.TextInput(
            attrs={
                "placeholder": "Folder location",
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )


class CreateShot(forms.Form):
    linked_choices = [
        ('AAJ', 'AAJ'),
        ('ICE', 'ICE'),
        ('SW9', 'SW9')
    ]

    task_template_choices = [
        ('AnimAssetBuildDev', 'AnimAssetBuildDev'),
        ('SequenceDev', 'SequenceDev'),
        ('SetAssetBuildDev', 'SetAssetBuildDev'),
        ('ShotDev', 'ShotDev'),
        ('StaticAssetBuildDev', 'StaticAssetBuildDev')
    ]

    assignee_choices = [
        ('kunal', 'kunal'),
        ('nitin', 'nitin'),
        ('attanu', 'attanu'),
        ('mahesh', 'mahesh'),
        ('ganesh', 'ganesh'),
        ('vishal', 'vishal'),
        ('ajay', 'ajay'),
        ('ayush', 'ayush')

    ]

    status_choice = [
        ('Not started', 'Not started'),
        ('Awaiting Data', 'Awaiting Data'),
        ('Ready to start', 'Ready to start'),
        ('In progress', 'In progress'),
        ('Completed', 'Completed'),
        ('On Hold', 'On Hold'),
        ('Omitted', 'Omitted'),
        ('Duplicate', 'Duplicate')
    ]

    priority_choices = [('None', 'None')]

    parent_object_type = forms.ChoiceField(
        choices=linked_choices,
        required=False,
        disabled=True,
        widget=forms.TextInput(
            attrs={
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
        # widget=forms.Select(
        #     attrs={
        #         'style': 'color:black;width: 250px;overflow: auto',
        #         'class': 'form-control'
        #     }
        # )
    )

    # task_template = forms.ChoiceField(
    #     choices=task_template_choices,
    #     widget=forms.Select(
    #         attrs={
    #             'style': 'color:black;width: 250px;overflow: auto',
    #             'class': 'form-control'
    #         }
    #     )
    # )
    shot_type_choice = [
        ("Static Shot", "Static Shot"),
        ("Dynamic", "Dynamic")
    ]
    shot_type = forms.ChoiceField(
        choices=shot_type_choice,
        disabled=False,
        required=True,
        widget=forms.Select(
            attrs={
                #'value': "Static Shot",
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )
    name = forms.CharField(
        disabled=False,
        required=True,
        widget=forms.TextInput(
            attrs={
                #'value': 'static shot',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control',
                'placeholder': 'Shot Name',
                'pattern': '[a-zA-Z0-9]'
            }
        )
    )
    description = forms.CharField(
        widget=forms.Textarea(
            attrs={
                'rows': '5',
                'cols': '32',
                'wrap': "hard",
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        ),
        required=False
    )
    # assigned_users = forms.MultipleChoiceField(
    #     widget=forms.SelectMultiple(attrs={
    #             'style': 'color:black;width: 250px;overflow: auto',
    #             'class': 'form-control'
    #         }
    #     ),
    #     choices=assignee_choices,
    #     required=False
    # )
    status = forms.ChoiceField(
        choices=status_choice,
        required=True,
        widget=forms.Select(
            attrs={
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )
    priority = forms.ChoiceField(
        choices=priority_choices,
        required=True,
        widget=forms.Select(
            attrs={
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )
    # scope = forms.ChoiceField(
    #     widget=forms.TextInput(
    #         attrs={
    #             'style': 'color:black;width: 250px;overflow: auto',
    #             'class': 'form-control'
    #         }
    #     ),
    #     required=False
    # )

    entity_name = forms.CharField(
        disabled=True,
        widget=forms.Textarea(
            attrs={
                'rows': '5',
                'cols': '32',
                'wrap': 'hard',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )
    # version = forms.CharField(
    #     disabled=True,
    #     widget=forms.Textarea(
    #         attrs={
    #             'rows': '5',
    #             'cols': '32',
    #             'wrap': 'hard',
    #             'style': 'color:black;width: 250px;overflow: auto',
    #             'class': 'form-control'
    #         }
    #     )
    # )
    frame_start = forms.CharField(
        widget=forms.TextInput(
            attrs={
                'value': '101',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        ),
        required=False
    )
    frame_end = forms.CharField(
        widget=forms.TextInput(
            attrs={
                'value': '100',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        ),
        required=False
    )

    # key_shot = forms.BooleanField(
    #     widget=forms.CheckboxInput(
    #         attrs={
    #             'checked': 'checked'
    #         }
    #     )
    # )#CheckboxInput()

    total_frames = forms.CharField(
        widget=forms.TextInput(
            attrs={
                'value': '0.0',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )
    frame_duration = forms.CharField(
        widget=forms.TextInput(
            attrs={
                'value': '0.0',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )
    key_frames = forms.CharField(
        widget=forms.Textarea(
            attrs={
                'rows': '5',
                'cols': '32',
                'wrap': 'hard',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control',
                'initial': '101,110'
            }
        ),
        required=False
    )

    # frame_handles = forms.CharField(
    #     widget=forms.TextInput(
    #         attrs={
    #             'value': '0',
    #             'style': 'color:black;width: 250px;overflow: auto',
    #             'class': 'form-control'
    #         }
    #     ),
    #     required=False
    # )


class CreateSequence(forms.Form):

    linked_choices = [
        # ('AAJ', 'AAJ'),
        # ('ICE', 'ICE'),
        # ('SW9', 'SW9')
    ]

    task_template_choices = [
        ('AnimAssetBuildDev', 'AnimAssetBuildDev'),
        ('SequenceDev', 'SequenceDev'),
        ('SetAssetBuildDev', 'SetAssetBuildDev'),
        ('ShotDev', 'ShotDev'),
        ('StaticAssetBuildDev', 'StaticAssetBuildDev')
    ]

    assignee_choices = [
        ('kunal', 'kunal'),
        ('nitin', 'nitin'),
        ('attanu', 'attanu'),
        ('mahesh', 'mahesh'),
        ('ganesh', 'ganesh'),
        ('vishal', 'vishal'),
        ('ajay', 'ajay'),
        ('ayush', 'ayush')
    ]

    status_choice = [
        ('Not started', 'Not started'),
        ('Awaiting Data', 'Awaiting Data'),
        ('Ready to start', 'Ready to start'),
        ('In progress', 'In progress'),
        ('Completed', 'Completed'),
        ('On Hold', 'On Hold'),
        ('Omitted', 'Omitted'),
        ('Duplicate', 'Duplicate')
    ]

    priority_choices = [('None', 'None')]

    sequence_parent_object_type = forms.ChoiceField(
        choices=linked_choices,
        required=False,
        disabled=True,
        widget=forms.TextInput(
            attrs={
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
        # widget=forms.Select(
        #     attrs={
        #         'style': 'color:black;width: 250px;overflow: auto',
        #         'class': 'form-control'
        #     }
        # )
    )

    # sequence_task_template = forms.ChoiceField(
    #     choices=task_template_choices,
    #     widget=forms.Select(
    #         attrs={
    #             'style': 'color:black;width: 250px;overflow: auto',
    #             'class': 'form-control'
    #         }
    #     )
    # )

    sequence_type = forms.CharField(
        disabled=True,
        required=True,
        widget=forms.TextInput(
            attrs={
                'value': "Sequence",
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )
    sequence_name = forms.CharField(
        disabled=False,
        required=True,
        widget=forms.TextInput(
            attrs={
                'value': '',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )
    sequence_description = forms.CharField(
        widget=forms.Textarea(
            attrs={
                'rows': '5',
                'cols': '32',
                'wrap': "hard",
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        ),
        required=False
    )

    # sequence_assignee = forms.MultipleChoiceField(
    #     widget=forms.SelectMultiple(
    #         attrs={
    #             'style': 'color:black;width: 250px;overflow: auto',
    #             'class': 'form-control'
    #         }
    #     ),
    #     choices=assignee_choices,
    #     required=False
    # )

    sequence_status = forms.ChoiceField(
        choices=status_choice,
        required=False,
        disabled=True,
        widget=forms.TextInput(
            attrs={
                'value': 'Not Started',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
        # widget=forms.Select(
        #     attrs={
        #         'style': 'color:black;width: 250px;overflow: auto',
        #         'class': 'form-control'
        #     }
        # )
    )

    sequence_priority = forms.ChoiceField(
        choices=priority_choices,
        required=True,
        widget=forms.Select(
            attrs={
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )

    # sequence_scope = forms.ChoiceField(
    #     widget=forms.TextInput(
    #         attrs={
    #             'style': 'color:black;width: 250px;overflow: auto',
    #             'class': 'form-control'
    #         }
    #     ),
    #     required=False
    # )

    sequence_entity_name = forms.CharField(
        disabled=True,
        widget=forms.Textarea(
            attrs={
                'rows': '5',
                'cols': '32',
                'wrap': 'hard',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )

    # sequence_version = forms.CharField(
    #     disabled=True,
    #     widget=forms.Textarea(
    #         attrs={
    #             'rows': '5',
    #             'cols': '32',
    #             'wrap': 'hard',
    #             'style': 'color:black;width: 250px;overflow: auto',
    #             'class': 'form-control'
    #         }
    #     )
    # )


class CreateAsset(forms.Form):

    linked_to = forms.CharField(
        widget=forms.TextInput(
            attrs={
                'style': 'color:black;width: 250px',
                'class': 'form-control'
            }
        )
    )

    asset_type_choices = [
        ("Set", "Set"),
        ("Vehicle", "Vehicle"),
        ("Prop", "Prop"),
        ("Character", "Character")
    ]

    asset_type = forms.ChoiceField(
        choices=asset_type_choices,
        required=True,
        widget=forms.Select(
            attrs={
                'style': 'color:black;width: 250px',
                'class': 'form-control'
            }
        )
    )

    asset_name = forms.CharField(
        required=True,
        widget=forms.TextInput(
            attrs={
                'style': 'color:black;width: 250px',
                'class': 'form-control'
            }
        )
    )

    asset_description = forms.CharField(
        disabled=False,
        widget=forms.Textarea(
            attrs={
                'rows': '5',
                'cols': '32',
                'wrap': 'hard',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )

    asset_status_choices = [
        ("Not Started", "Not Started"),
        ("Awaiting Data", "Awaiting Data"),
        ("Ready to Start", "Ready to Start"),
        ("In progress", "In progress"),
        ("Completed", "Completed"),
        ("On Hold", "On Hold"),
        ("Omitted", "Omitted"),
        ("Duplicate", "Duplicate"),
        ("Outsource", "Outsource"),
        ("Outsource Approved", "Outsource Approved"),
        ("Outsource Reject", "Outsource Reject"),
    ]
    asset_status = forms.ChoiceField(
        choices=asset_status_choices,
        widget=forms.Select(
            attrs={
                'style': 'color:black;width: 250px',
                'class': 'form-control'
            }
        )
    )

    asset_priority_choices = [
        ("Urgent", "Urgent"),
        ("High", "High"),
        ("Medium", "Medium"),
        ("Low", "Low"),
        ("None", "None"),
    ]
    asset_priority = forms.ChoiceField(
        choices=asset_priority_choices,
        widget=forms.Select(
            attrs={
                'style': 'color:black;width: 250px',
                'class': 'form-control'
            }
        )
    )

    asset_scope = forms.CharField(
        widget=forms.TextInput(
            attrs={
                'style': 'color:black;width: 250px',
                'class': 'form-control'
            }
        )
    )

    asset_entity_name = forms.CharField(
        disabled=False,
        widget=forms.Textarea(
            attrs={
                'rows': '5',
                'cols': '32',
                'wrap': 'hard',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )

    asset_version = forms.CharField(
        disabled=False,
        widget=forms.Textarea(
            attrs={
                'rows': '5',
                'cols': '32',
                'wrap': 'hard',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )

    asset_client_label = forms.CharField(
        disabled=False,
        widget=forms.Textarea(
            attrs={
                'rows': '5',
                'cols': '32',
                'wrap': 'hard',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )

    asset_sub_category = forms.CharField(
        disabled=False,
        widget=forms.Textarea(
            attrs={
                'rows': '5',
                'cols': '32',
                'wrap': 'hard',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )


class CreateTask(forms.Form):

    def __init__(self, choices, *args, **kwargs):
        super(CreateTask, self).__init__(*args, **kwargs)
        self.fields['task_status'].choices = choices

    task_linked_to = forms.CharField(
        disabled=True,
        widget=forms.TextInput(
            attrs={
                'style': 'color:black;width: 250px',
                'class': 'form-control'
            }
        )
    )

    task_type = forms.ChoiceField(
        required=True,
        choices=(),
        widget=forms.Select(
            attrs={
                'style': 'color:black;width: 250px',
                'class': 'form-control'
            }
        )
    )

    task_name = forms.CharField(
        disabled=False,
        widget=forms.TextInput(
            attrs={
                'style': 'color:black;width: 250px',
                'class': 'form-control'
            }
        )
    )

    task_description = forms.CharField(
        widget=forms.Textarea(
            attrs={
                'rows': '5',
                'cols': '32',
                'wrap': 'hard',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )

    task_assignee = forms.MultipleChoiceField(
        choices=(),
        required=True,
        widget=forms.SelectMultiple(
            attrs={
                'style': 'color:black;width: 250px',
                'class': 'form-control'
            }
        )
    )

    task_bid_days = forms.IntegerField(
        required=True,
        widget=forms.TextInput(
            attrs={
                'style': 'color:black;width: 250px',
                'class': 'form-control'
            }
        )
    )

    task_status = forms.ChoiceField(
        choices=(),
        required=True,
        widget=forms.Select(
            attrs={
                'style': 'color:black;width: 250px',
                'class': 'form-control'
            }
        )
    )

    task_priority_choices = [
        ('High', 'High'),
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('Urgent', 'Urgent'),
        ('None', 'None'),
    ]

    task_priority = forms.ChoiceField(
        choices=task_priority_choices,
        required=True,
        widget=forms.Select(
            attrs={
                'style': 'color:black;width: 250px',
                'class': 'form-control'
            }
        )
    )

    task_start_date = forms.DateField(
        required=True,
        input_formats="%Y-%m-%d",
        widget=forms.DateInput(
            attrs={
                'style': 'color:black;width: 250px',
                'class': 'form-control',
                "placeholder": 'Start Date'
            }
        )
    )

    task_due_date = forms.DateField(
        required=True,
        input_formats="%Y-%m-%d",
        widget=forms.DateInput(
            attrs={
                'style': 'color:black;width: 250px',
                'class': 'form-control',
                "placeholder": 'Due Date'
            }
        )
    )

    task_scope = forms.CharField(
        widget=forms.TextInput(
            attrs={
                'style': 'color:black;width: 250px',
                'class': 'form-control',
                "placeholder": 'Scope'
            }
        )
    )
    task_entity_name = forms.CharField(
        widget=forms.Textarea(
            attrs={
                'rows': '5',
                'cols': '32',
                'wrap': 'hard',
                'style': 'color:black;width: 250px;overflow: auto',
                'class': 'form-control'
            }
        )
    )
